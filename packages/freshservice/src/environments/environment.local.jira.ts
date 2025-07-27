export const environment = {
    production: false,
    pluginMode: 'jira',
    pluginConfigName: 'jira_v3',
    tenants: [
        {
            origin: 'https://megatelecom-ti-sandbox-918.atlassian.net',
            url: 'https://mega.digiteam.com.br'
        },
        {
            origin: 'https://megatelecom-ti.atlassian.net',
            url: 'https://mega.digiteam.cloud'
        },
        {
            origin: 'http://localhost:4200',
            url: 'https://megahml.digiteam.com.br'
        },
        {
            origin: 'https://dev-test-dg.atlassian.net',
            url: 'http://megahml.localhost'
        },
        {
            origin: 'https://jiraapphml.digiteam.com.br',
            url: 'https://megahml.digiteam.com.br'
        },
        {
            origin: 'https://jiraapp.digiteam.com.br',
            url: 'https://mega.digiteam.com.br'
        }
    ]
};
