// declare a new module called 'myApp', and make it require the `ng-admin` module as a dependency
var myApp = angular.module('myApp', ['ng-admin']);

// declare a function to run when the module bootstraps (during the 'config' phase)
myApp.config(['NgAdminConfigurationProvider', function (nga) {
    // create an admin application
    var admin = nga.application('Friendship Names')
    .baseApiUrl('http://localhost:3000/api/v1/'); // main API endpoint
    // create a name entity
    // the API endpoint for this entity will be 'http://localhost:8080/api/v1/names/:id
    var names = nga.entity('names');
    // set the fields of the name entity list view
    names.listView().fields([
//        nga.field('id'),
        nga.field('name').isDetailLink(true),
        nga.field('gender', 'choice').choices([
            { value: 0, label: 'male' },
            { value: 1, label: 'female' },
        ]),
        nga.field('meaning'),
        nga.field('scripture'),
        nga.field('creationdate', 'datetime').label('Created'),
        nga.field('modificationdate', 'datetime').label('Last Modified')
    ]);
    names.listView().filters([
        nga.field('name').pinned(true),
        nga.field('gender', 'choice').choices([
            { value: 0, label: 'male' },
            { value: 1, label: 'female' },
        ]),
        nga.field('meaning'),
        nga.field('scripture')
    ]);
    names.creationView().fields([
        nga.field('name'),
        nga.field('gender', 'choice').choices([
            { value: 0, label: 'male' },
            { value: 1, label: 'female' },
        ]),
        nga.field('meaning'),
        nga.field('scripture')
    ]);
    // use the same fields for the editionView as for the creationView
    names.editionView().fields(names.creationView().fields());
    //names.editionView().title('Edit "{{ names.values.name }}"');

    // add the names entity to the admin application
    admin.addEntity(names);

    // attach the admin application to the DOM and execute it
    nga.configure(admin);
}]);
// myApp.config(['RestangularProvider', function(RestangularProvider) {
//     var login = 'admin',
//         password = '53cr3t',
//         token = window.btoa(login + ':' + password);
//     RestangularProvider.setDefaultHeaders({'Authorization': 'Basic ' + token});
// }]);
