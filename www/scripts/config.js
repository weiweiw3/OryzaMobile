angular.module('myApp.config', [])
    .constant('version', '1.0')
    .constant('ApiEndpoint', {
        url: 'https://114.215.185.243/data-app/rs/task'
    })
    .constant('taskUrl', {
        //  url: 'http://localhost:8100/data-app/rs/task'
        url: 'https://114.215.185.243/data-app/rs/task'
    })
    .constant('SearchUrl', {
        url: 'https://218.244.136.132'
    })
    .constant('config',{
        timeout:3000
    })
    .constant('COMPANY', '40288b8147cd16ce0147cd236df20000')

    // where to redirect users if they need to authenticate (see security.js)
    .constant('loginRedirectPath', '/login')

    // your Firebase data URL goes here, no trailing slash
    .constant('FBURL', 'https://40288b8147cd16ce0147cd236df20000.firebaseio.com')

    // double check that the app has been configured before running it and blowing up space and time
    .run(['FBURL', '$timeout', function (FBURL, $timeout) {
        if (FBURL.match('//INSTANCE.firebaseio.com')) {
            angular.element(document.body).html('<h1>Please configure app/config.js before running!</h1>');
            $timeout(function () {
                angular.element(document.body).removeClass('hide');
            }, 250);
        }
    }])

    // end this with a trailing slash
    .constant('FIREBASE_URL', 'https://40288b8147cd16ce0147cd236df20000.firebaseio.com/')

    //
    .constant('loginRedirectPath', '/login')

    // max number of feeds to display
    .constant('FB_LIVE_LIMIT', 5)

    // how often we check for new feeds; most sites will not allow you to do this more than every 60 mins
    .constant('CHECK_INTERVAL', 30 * 60 * 1000 /* 30 mins */) //todo investigate pubsubhubbub

    // number of RSS articles we fetch from each URL when an update takes place
    // larger numbers will make performance slow, since we can only see the latest 25
    // there's no reason to get far beyond that here
    .constant('NUMBER_TO_FETCH', 5)

    // firebase Path
    .constant('FB_PATH', {
        users_: 'users/', //_ means end this with a trailing slash
        userProfile_: 'profile/',
        REPLACE_DOT: '||' // replace '.' in email
    })


    .constant('authProviders', [
//        { id: 'twitter',  name: 'Twitter',  icon: 'icon-twitter'  },
//        { id: 'facebook', name: 'Facebook', icon: 'icon-facebook' },
//        { id: 'github',   name: 'GitHub',   icon: 'icon-github'   },
        {id: 'password', name: 'Email', icon: 'icon-envelope'}
    ])

    .config(function ($logProvider) {
        // uncomment to enable dev logging in the app
        //$logProvider.debugEnabled && $logProvider.debugEnabled(true);
    });