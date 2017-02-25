/**
 * Created by zoonman on 11/6/16.
 */

if (window.history && window.history.pushState) {
  // we are good
} else {
  if (window.confirm('Your browser is so old that stinks! Would like to update it now?')) {
    window.location = 'http://browsehappy.com/?locale=en';
  }
}

// polyfill to get length
Object.prototype.numberOfKeys = function() {
  return Object.keys(this).length;
};

Array.prototype._idMerge = function(secondArray) {
  for (var j = 0, jl = secondArray.length; j < jl; j++) {
    var foundIndex = -1;
    for (var i = 0, il = this.length; i < il; i++) {
      if (secondArray[j].hasOwnProperty('_id') &&
          this[i].hasOwnProperty('_id') &&
          secondArray[j]._id === this[i]._id) {
        foundIndex = i;
      }
    }
    if (foundIndex > -1) {
      this[foundIndex] = secondArray[j];
    } else {
      this.unshift(secondArray[j]);
    }
  }
  return this;
};

var app = angular.module(
    'app',
    [
      'ngSanitize', 'ngLocale',
      'ngAnimate', 'ngRoute', 'ngStorage', 'ngMessages',
      'pascalprecht.translate', 'tmh.dynamicLocale',
      '720kb.socialshare'
    ]
    );

app.constant('LOCALES', {
  'locales': {
    'en_US': 'English',
    'ru_RU': 'Русский'
  },
  'preferredLocale': 'en_US'
});

app.config([
  '$locationProvider', '$routeProvider',
  '$localStorageProvider', '$sessionStorageProvider',
  '$translateProvider', 'tmhDynamicLocaleProvider',
  function($locationProvider, $routeProvider,
      $localStorageProvider, $sessionStorageProvider, $translateProvider,
      tmhDynamicLocaleProvider) {
    //
    $routeProvider
        .when('/ask', {
          controller: 'EditTopicController',
          templateUrl: '/dist/t/topic.edit.tpl'
        })
        .when('/ask?category=:category', {
          controller: 'EditTopicController',
          templateUrl: '/dist/t/topic.edit.tpl'
        })
        .when('/edit/:slug', {
              controller: 'EditTopicController',
              templateUrl: '/dist/t/topic.edit.tpl'
        })
        .when('/settings', {
              controller: 'SettingsController',
              templateUrl: '/dist/t/settings.tpl'
        })
        .when('/users/:slug', {
          controller: 'UsersInfoController',
          controllerAs: 'uctl',
          templateUrl: '/dist/t/users.info.tpl'
        })
        .when('/users', {
          controller: 'UsersOnlineController',
          controllerAs: 'uctl',
          templateUrl: '/dist/t/users.tpl'
        })
        .when('/users/password/restore', {
          controller: 'UsersPasswordRestoreCtrl',
          controllerAs: 'uctl',
          templateUrl: '/dist/t/users.password.restore.tpl'
        })
        .when('/:category/:topic', {
          controller: 'TopicDetailsCtrl',
          controllerAs: 'topic',
          templateUrl: '/dist/t/topic.view.tpl'
        })
        .when('/:category', {
          controller: 'TopicStubCtrl',
          controllerAs: 'topicStub',
          templateUrl: '/dist/t/topics.tpl'
        })
        .when('/', {
          controller: 'WelcomeCtrl',
          templateUrl: '/dist/t/welcome.tpl'
        })
        .otherwise('/');

    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });

    $localStorageProvider.setKeyPrefix('lr_');
    $sessionStorageProvider.setKeyPrefix('lr_');

    if ($localStorageProvider.supported()) {
      var deviceId = $localStorageProvider.get('deviceId');
      if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 15);
        $localStorageProvider.set('deviceId', deviceId);
      }
    } else {
      alert('Enable Local storage!');
    }

    $translateProvider.useMissingTranslationHandlerLog();
    $translateProvider.useMessageFormatInterpolation();
    $translateProvider.useStaticFilesLoader({
      prefix: '/dist/l/lr-',
      suffix: '.json'
    });
    tmhDynamicLocaleProvider.localeLocationPattern(
        '/dist/l/angular-locale_{{locale}}.js'
    );
    $translateProvider.preferredLanguage('en_US');
    $translateProvider.useSanitizeValueStrategy('escape');
    $translateProvider.fallbackLanguage(['en_US', 'ru_RU']);
  }
]);

app.run(function(PerfectScrollBar) {
  PerfectScrollBar.setup('topics');
  FastClick.attach(document.body);
});

function array_id_merge(firstArray, secondArray, slug) {
  var items = [], newItems = [];
  items = items.concat(firstArray);
  items = items.concat(secondArray);

  var extractValueToCompare = function(item) {
    if (angular.isObject(item)) {
      return item['_id'];
    } else {
      return item;
    }
  };

  angular.forEach(items, function(item) {
        var isDuplicate = false;
        for (var i = 0; i < newItems.length; i++) {
          var a = extractValueToCompare(newItems[i]);
          var b = extractValueToCompare(item);
          if (angular.equals(a, b)) {
            isDuplicate = true;
            //break;
            if (newItems[i].updated < item.updated) {
              newItems[i].updated = item.updated;
            } else {
              item.updated = newItems[i].updated;
            }
          }
        }
        if (!isDuplicate) {
          if (slug) {
            item.active = (item.slug === slug);
          }

          newItems.push(item);
        }
      }
  );
  items = newItems;
  return items;
}
