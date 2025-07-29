import {Routes, Route} from 'react-router-dom';
import LoginScreen from '../components/LoginScreen';
import React from 'react';
import HomeScreen from '../components/HomeScreen';
import OrderCreateFormView from '../components/order-create/OrderCreateFormView';
import LoadErrorView from '../components/LoadErrorView';
import LoadErrorViewPlugin from '../components/LoadErrorViewPlugin';
import { HelloWorld } from '@digiteam/share';

const AppRoutes = () => {
    const handleOrderSubmit = (data: any) => {
        console.log('Order submitted', data);
    };
    return (
        <Routes>
            <Route path="/" element={<LoginScreen/>}/>
            {/* <Route path="/" element={<HelloWorld text="Hola desde UI compartida Freshservice" />}/> */}
            <Route path="/error" element={<LoadErrorView/>}/>
            <Route path="/error_plugin" element={<LoadErrorViewPlugin/>}/>
            <Route path="/home" element={<HomeScreen/>}/>
            <Route
                path="/orderCreateFormView"
                element={
                    <div
                        className="h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-4">
                        <OrderCreateFormView onSubmit={handleOrderSubmit}/>
                    </div>
                }
            />

        </Routes>
    );
};

export default AppRoutes;
