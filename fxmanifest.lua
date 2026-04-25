fx_version 'cerulean'
game 'gta5'

name 'ez_tablet'
author 'ez'

ui_page 'html/index.html'

files {
    -- CORE UI
    'html/index.html',
    'html/tabletApp.js',
    'html/app.js',
    'html/style.css',

    -- CORE MODULES
    'html/core/home.js',

    -- APPS
    'html/apps/calculator.js',
    'html/apps/bank.js',
    'html/apps/cmd.js',
    'html/apps/email.js',
    'html/apps/YellowPages.js'
}

shared_scripts {
    '@es_extended/imports.lua',
    'shared/config.lua',
    '@ox_lib/init.lua'
}

client_scripts {
    'client/main.lua',
    'client/email.lua',
    'client/yellowpages.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua',
    'server/email.lua',
    'server/yellowpages.lua'
}