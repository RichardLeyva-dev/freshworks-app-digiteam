import React, {FC, useEffect,  useRef, useState} from 'react';
import {useForm, Controller, SubmitHandler} from 'react-hook-form';
import {Dropdown} from 'primereact/dropdown';
import {InputText} from 'primereact/inputtext';
import {Button} from 'primereact/button';
import {Calendar} from 'primereact/calendar';
import {Toast} from 'primereact/toast';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {forkJoin, Observable, of, Subscription} from 'rxjs';

import {DigiteamApiService} from '../../services/DigiteamApiService';
import {useLoadGoogleMaps} from '../../services/UseLoadGoogleMaps';
import MapToggle from './MapToggle';

import {OrderTypeModel} from '../../models/order-type-model';
import {PriorityModel} from '../../models/priority-model';
import {OrganizationModel} from '../../models/organization-model';
import {RegionModel} from '../../models/region-model';
import {CreateOrderRequest} from '../../models/create-order-request';
import {DigiteamMappingModel, RequesterModel} from '../../models/config.model';
import {usePlatform} from '../../context/PlatformContext';
import {TicketInfo} from '../../models/ticket-info.model';
import {DigiteamFieldIdEnum} from '../../enums/digiteam-field-id.enum';
import {ThirdPartyConfigService} from '../../services/ThirdPartyConfigService';
import {FormNameValueModel} from '../../models/form-name-value.model';


interface Props {
    onSubmit: (data: any) => void;
}

type OrderFormInputs = {
    phone: string;
    orderType: OrderTypeModel;
    priority: PriorityModel;
    unit: OrganizationModel;
    region: RegionModel;
    address: string;
    dueDate: Date;
    notes?: string;
};

const OrderCreateFormView: FC<Props> = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const digiteam = new DigiteamApiService();
    const toast = useRef<Toast>(null);
    const {reset} = useForm<OrderFormInputs>();

    const {
        control,
        handleSubmit,
        register,
        watch,
        setError,
        setValue, getValues,
        formState: {errors},
    } = useForm<OrderFormInputs>();

    const [units, setUnits] = useState<OrganizationModel[]>([]);
    const [regions, setRegions] = useState<RegionModel[]>([]);
    const [types, setTypes] = useState<OrderTypeModel[]>([]);
    const [priorities, setPriorities] = useState<PriorityModel[]>([]);
    const [countries, setCountries] = useState<DigiteamMappingModel[]>([]);
    const [cfgLoaded, setCfgLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [requester] = useState<RequesterModel>({
        id: '',
        name: '',
        email: '',
        phone: '',
        title: '',
        locale: '',
        avatar: '',
    });

    const [showMap, setShowMap] = useState(false);
    const mapsReady = useLoadGoogleMaps();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const orderSubmitRef = useRef<Subscription | null>(null);

    const platform = usePlatform();
    const [configService, setConfig] = useState<ThirdPartyConfigService | null>(null);
    const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);

    const orderAddress = useRef({
        street: null as string | null,
        neighborhood: null as string | null,
        postalCode: null as string | null,
        city: null as string | null,
        state: null as string | null,
        country: null as string | null,

        isValid() {
            return [this.street, this.city, this.state, this.country]
                .every(v => !!v && v.trim() !== '');
        },
        getMissing() {
            const out: string[] = [];

            if (!this.country) {
                out.push(t('address.country'));
            }
            if (!this.state) {
                out.push(t('address.state'));
            }
            if (!this.city) {
                out.push(t('address.city'));
            }
            if (!this.street) {
                out.push(t('address.street'));
            }
            return out;
        }
    });

    const buildAddressPatch = (): Partial<CreateOrderRequest> => {
        const a = orderAddress.current;
        return {
            ...(a.street && {street: a.street}),
            ...(a.neighborhood && {neighborhood: a.neighborhood}),
            ...(a.postalCode && {postalCode: a.postalCode}),
            ...(a.city && {city: a.city}),
            ...(a.state && {state: a.state}),
            ...(a.country && {country: a.country}),
        };
    };

    function isCountryAllowed(): boolean {
        if (!orderAddress.current.country) {
            return false;
        }

        const found = countries.some(
            c => orderAddress.current.country && c.externalValue.trim().toLowerCase() === orderAddress.current.country.trim().toLowerCase()
        );

        if (!found) {
            toast.current?.show({
                severity: 'error',
                summary: t('toast.error.title'),
                detail: t('toast.error.invalid_country'),
            });
        }
        return found;
    }

    const prepareAddress$ = (): Observable<boolean> => {
        const missing = orderAddress.current.getMissing();

        if (missing.length) {
            toast.current?.show({
                severity: 'warn',
                summary: t('toast.address_incomplete_title'),
                detail: t('toast.address_incomplete_detail', {fields: missing.join(', ')}),
            });
            return of(false);
        }
        if (!isCountryAllowed()) {
            return of(false);
        }

        return of(true);
    };

    useEffect(() => {
        const sub = digiteam.getThirdPartyPluginConfig().subscribe(cfg => {
            if (!cfg) {
                navigate('/error_plugin');
                return;
            }
            digiteam.supportAppConfig = cfg;
            const conf = new ThirdPartyConfigService(cfg);
            platform.setConfig(cfg);
            setConfig(conf);
            console.log('🟢 Config loaded:', cfg);
            setCfgLoaded(true);
        });
        return () => sub.unsubscribe();
    }, []);

    useEffect(() => {
        const unit = watch('unit');
        if (!unit?.id) {
            setRegions([]);
            return;
        }
        const sub = digiteam.getRegions(unit.id).subscribe(setRegions);
        return () => sub.unsubscribe();
    }, [watch('unit')]);

    useEffect(() => {
        if (!cfgLoaded) {
            return;
        }
        setLoading(true);
        const sub = forkJoin({
            ticketInfoResult: platform.getTicketInfo(),
            priorities: digiteam.getPriorities(),
            countries: digiteam.getCountries(),
            orderTypes: digiteam.getOrderTypes(),
            units: digiteam.getUnits(),
        }).subscribe({
            next: ({ticketInfoResult, priorities, countries, orderTypes, units}) => {
                setTicketInfo(ticketInfoResult);
                setPriorities(priorities);
                setCountries(countries);
                setTypes(orderTypes);
                setUnits(units.filter(u => u.unitCode));
                const selectedPrio = priorities.find(p => p.id === ticketInfoResult.priority);
                if (selectedPrio) {
                    setValue('priority', selectedPrio);
                }

                if (ticketInfoResult.requester?.phone) {
                    setValue('phone', ticketInfoResult.requester.phone);
                }

                const addressStreet = ticketInfoResult.getExtraField(DigiteamFieldIdEnum.SERVICE_ADDRESS_STREET)?.value;
                if (addressStreet) {
                    setValue('address', addressStreet);
                }

                orderAddress.current.street = ticketInfoResult.getExtraField(DigiteamFieldIdEnum.SERVICE_ADDRESS_STREET)?.value ?? null;
                orderAddress.current.neighborhood = ticketInfoResult.getExtraField(DigiteamFieldIdEnum.SERVICE_ADDRESS_NEIGHBORHOOD)?.value ?? null;
                orderAddress.current.postalCode = ticketInfoResult.getExtraField(DigiteamFieldIdEnum.SERVICE_ADDRESS_POSTALCODE)?.value ?? null;
                orderAddress.current.city = ticketInfoResult.getExtraField(DigiteamFieldIdEnum.SERVICE_ADDRESS_CITY)?.value ?? null;
                orderAddress.current.state = ticketInfoResult.getExtraField(DigiteamFieldIdEnum.SERVICE_ADDRESS_STATE)?.value ?? null;
                const country = ticketInfoResult.getExtraField(DigiteamFieldIdEnum.SERVICE_ADDRESS_COUNTRY)?.value;

                if (country) {
                    const selectedCountry = countries.find(c => c.externalValue.toUpperCase() === country.toUpperCase());
                    if (selectedCountry) {
                        orderAddress.current.country = selectedCountry.digiteamValue;
                    }
                }

                const raw = [
                    orderAddress.current.street,
                    orderAddress.current.city,
                    orderAddress.current.state,
                    orderAddress.current.country,
                ].filter(Boolean).join(', ');

                if (raw) {
                    setValue('address', raw);
                }
            },
            error: err => {
                console.error('🔴 Error loading data', err);
                toast.current?.show({
                    severity: 'error',
                    summary: t('toast.error.title'),
                    detail: t('toast.error.submitFailed'),
                });
            },
            complete: () => {
                setLoading(false);
            }
        });
        return () => sub.unsubscribe();
    }, [cfgLoaded]);

    const onCreate = () => {
        const runSubmit = handleSubmit(createOrder);

        if (digiteam.canUseGeolocation()) {
            setLoading(true);
            prepareAddress$().subscribe(ok => {
                if (ok) {
                    runSubmit();
                } else {
                    setError('address', {type: 'manual', message: t('form.invalidAddress')});
                }
                setLoading(false);
            });
        } else {
            runSubmit();
        }
    };

    const createOrder: SubmitHandler<OrderFormInputs> = data => {

        if (!ticketInfo?.id) {
            console.error("❌ Ticket ID is not available");
            toast.current?.show({
                severity: 'error',
                summary: t('toast.error.title'),
                detail: t('toast.error.ticketIdMissing'),
            });
            return;
        }
        if (!configService) {
            console.error("❌ ConfigService is not initialized");
            toast.current?.show({
                severity: 'error',
                summary: t('toast.error.title'),
                detail: t('toast.error.configServiceMissing'),
            });
            return;
        }

        const payload: CreateOrderRequest = {
            estimatedDuration: 0,
            ticketingSystemCode: `${configService.getTicketPrefix()}${ticketInfo.id}`,
            orderTypeCode: data.orderType.code,
            useUnitCodeToResolveOrganization: true,
            location: data.region.code,
            applicantName: ticketInfo.requester?.name,
            applicantPhoneNumber: getValues('phone'),
            latitude: 0,
            longitude: 0,
            priority: data.priority.id,
            serviceAddress: getValues('address'),
            organizationUnitCode: data.unit.unitCode,
            notes: getValues('notes'),
            extraFieldList: [
                ...ticketInfo.extraFields, ...getDigiteamFormFields()
            ],
            crmAccountCode: ticketInfo.getExtraField('N#CRM_ACCOUNT')?.value ?? '',
            serviceDueDate: ticketInfo.serviceDueDate,
            ...buildAddressPatch(),
        };

        setIsSubmitting(true);
        console.log('PAYLOAD ⇒', payload);

        orderSubmitRef.current = digiteam.createOrder(payload).subscribe({
            next: () => {
                toast.current?.show({
                    severity: 'success',
                    summary: t('toast.success.title'),
                    detail: t('toast.success.orderCreated'),
                });
                reset();
                setIsSubmitting(false);
                navigate('/');
            },
            error: () => {
                toast.current?.show({
                    severity: 'error',
                    summary: t('toast.error.title'),
                    detail: t('toast.error.submitFailed'),
                });
                setIsSubmitting(false);
            },
        });

    };

    const getDigiteamFormFields = (): FormNameValueModel[] => {
        if (!configService) {
            return [];
        }

        const formValues: FormNameValueModel[] = [];

        configService.getMappings()
            .filter(m => m.source === 'create_order_form' && m.sourceFieldPath)
            .forEach(m => {
                const value = getValues(m.sourceFieldPath as any);
                if (value !== undefined && value !== null && value !== '') {
                    formValues.push({
                        name: m.targetFieldId,
                        value
                    });
                }
            });

        return formValues;
    };


    if (loading || !mapsReady) {
        return (
            <div className="flex justify-center items-center h-80">
                <i className="pi pi-spin pi-spinner text-blue-500 text-xl"/>
                <span className="ml-2 text-sm">{t('loading')}</span>
            </div>
        );
    }

    const validationRules = {
        phone: {
            required: t('form.validation.phoneRequired'),
            pattern: {value: /^\d{10,15}$/, message: t('form.validation.phoneInvalid')}
        },
        address: {
            required: t('form.validation.addressRequired'),
        },
        orderType: {required: t('form.validation.orderTypeRequired')},
        priority: {required: t('form.validation.priorityRequired')},
        unit: {required: t('form.validation.unitRequired')},
        region: {required: t('form.validation.regionRequired')},
        dueDate: {
            required: t('form.validation.dueDateRequired'),
            validate: (value: Date) => value > new Date() || t('form.validation.dueDateFuture')
        },
    };

    return (
        <div className="fixed inset-0 pr-2 p-0 m-0 overflow-auto bg-white">
            <Toast ref={toast}/>
            <form onSubmit={handleSubmit(onCreate)} onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                }
            }} className="space-y-4">

                <div className="flex justify-between items-center mb-2">
                    <div className="flex gap-1">
                        <Button onClick={() => navigate(-1)} label="Ordens" icon="pi pi-list"
                                className="bg-blue-500 border-blue-600 text-white px-4 py-2 rounded-md"/>
                        <Button label={t('order.save')} disabled={isSubmitting} icon="pi pi-save"
                                className="bg-blue-500 border-blue-600 text-white px-4 py-2 rounded-md" type="submit"/>
                    </div>
                </div>

                <div className="mb-4">
                    <span className="font-semibold block leading-tight">{requester.name}</span>
                    <span className="text-sm text-gray-600 block">{requester.email}</span>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">{t('order.phone')}</label>

                    <InputText
                        {...register('phone', validationRules.phone)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 h-[42px]"
                        onInput={(e) => {
                            const value = e.currentTarget.value;

                            if (!/^\d*$/.test(value)) {
                                e.currentTarget.value = value.replace(/\D/g, '');
                                toast.current?.show({
                                    severity: 'warn',
                                    summary: t('toast.warning.title'),
                                    detail: t('toast.warning.errorNumericField'),
                                });
                            }
                        }}
                    />
                    {errors.phone && <p className="text-red-500 mt-1 pl-1 text-sm">{errors.phone.message}</p>}
                </div>
                <Controller
                    name="orderType"
                    control={control}
                    rules={validationRules.orderType}
                    render={({field}) => (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {t('order.orderType')}
                            </label>
                            <Dropdown
                                {...field}
                                options={types}
                                optionLabel="name"
                                placeholder={t('form.select') || 'Select'}
                                filter
                                showClear
                                className="w-full border border-gray-300 rounded-md"
                                pt={{
                                    filterInput: {
                                        className: 'h-10 text-sm px-2 box-border'
                                    }
                                }}
                            />
                            {errors.orderType && (
                                <p className="text-red-500 mt-1 pl-1 text-sm">{errors.orderType.message}</p>
                            )}
                        </div>
                    )}
                />
                <Controller
                    name="priority"
                    control={control}
                    rules={validationRules.priority}
                    render={({field}) => (
                        <>
                            <label className="block text-sm font-medium mb-1">
                                {t('order.priority')}
                            </label>

                            <Dropdown
                                {...field}
                                onChange={(e) => field.onChange(e.value ? e.value : null)}
                                value={field.value ?? null}
                                options={priorities}
                                optionLabel="name"
                                dataKey="id"
                                placeholder={t('form.select') ?? 'Select'}
                                className="w-full border border-gray-300 rounded-md"
                                filter
                                showClear
                                pt={{filterInput: {className: 'h-10 text-sm px-2 box-border'}}}
                            />

                            {errors.priority && (
                                <p className="text-red-500 mt-1 pl-1 text-sm">{errors.priority.message}</p>
                            )}
                        </>
                    )}
                />
                <Controller
                    name="unit"
                    control={control}
                    rules={validationRules.unit}
                    render={({field}) => (
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('order.unit')}</label>
                            <Dropdown
                                {...field}
                                options={units.filter(unit => unit.unitCode !== null)}
                                optionLabel="name"
                                placeholder={t('form.select') || 'Select'}
                                filter
                                showClear
                                className="w-full border border-gray-300 rounded-md"
                                pt={{
                                    filterInput: {
                                        className: 'h-10 text-sm px-2 box-border',
                                    },
                                }}
                            />
                            {errors.unit && (
                                <p className="text-red-500 mt-1 pl-1 text-sm">{errors.unit.message}</p>
                            )}
                        </div>
                    )}
                />
                <Controller name="region" control={control} rules={validationRules.region} render={({field}) => (
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('order.region')}</label>
                        <Dropdown {...field} options={regions} optionLabel="name"
                                  placeholder={t('form.select') || 'Select'} disabled={!units}
                                  filter
                                  showClear
                                  className="w-full border border-gray-300 rounded-md"
                                  pt={{
                                      filterInput: {
                                          className: 'h-10 text-sm px-2 box-border'
                                      }
                                  }}
                        />
                        {errors.region && <p className="text-red-500 mt-1 pl-1 text-sm">{errors.region.message}</p>}
                    </div>
                )}/>
                <div className="relative">
                    <label className="block text-sm font-medium mb-1">{t('order.address')}</label>
                    <InputText
                        {...register('address', validationRules.address)}
                        className="w-full border border-gray-300 rounded-md h-[42px] pr-10 px-3"
                    />
                    {errors.address && (
                        <p className="text-red-500 mt-1 pl-1 text-sm">{errors.address.message}</p>
                    )}
                    <Button
                        type="button"
                        icon="pi pi-map-marker"
                        className="absolute top-[30px] right-2 p-button-text"
                        onClick={() => setShowMap((prev) => !prev)}
                        tooltip={showMap ? t('Ocultar mapa') : t('Mostrar mapa')}
                        tooltipOptions={{position: 'left'}}
                    />
                </div>
                <Controller
                    name="notes"
                    control={control}
                    render={({field}) => (
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('order.create.notes')}</label>
                            <textarea
                                {...field}
                                rows={4}
                                className="w-full border border-gray-300 rounded-md p-2"
                                placeholder={t('order.create.notes') || 'Notas'}
                            />
                        </div>
                    )}
                />
                <Controller name="dueDate" control={control} rules={validationRules.dueDate} render={({field}) => (
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('order.dueDateClient')}</label>
                        <Calendar {...field} showIcon showTime hourFormat="24" dateFormat="dd/mm/yy"
                                  hideOnDateTimeSelect readOnlyInput
                                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                                  inputClassName="w-full h-[42px] text-sm" placeholder="dd/mm/aaaa hh:mm"
                                  panelClassName="z-[9999]"/>
                        {errors.dueDate && <p className="text-red-500 mt-1 pl-1 text-sm">{errors.dueDate.message}</p>}
                    </div>
                )}/>
                {showMap && <div className="mt-3"><MapToggle/></div>}

                <div className="flex justify-end">
                    <Button label={t('order.save')} disabled={isSubmitting} icon="pi pi-save"
                            className="bg-blue-500 border-blue-600 text-white px-4 py-2 rounded-md" type="submit"/>
                </div>
            </form>
        </div>
    );
};
export default OrderCreateFormView;
