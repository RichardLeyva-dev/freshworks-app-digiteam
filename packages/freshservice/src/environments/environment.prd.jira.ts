export const environment = {
    production: true,
    pluginMode: 'jira',
    pluginConfigName: 'jira_v3',
    tenants: [
        {
            origin: 'https://megatelecom-ti-sandbox-918.atlassian.net',
            url: 'https://megahml.digiteam.com.br'
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
            url: 'https://megahml.digiteam.com.br'
        },
        {
            origin: 'https://jiraapphml.digiteam.com.br',
            url: 'https://megahml.digiteam.com.br'
        },
        {
            origin: 'https://jiraapp.digiteam.com.br',
            url: 'https://megahml.digiteam.com.br'
        }
    ]
};
