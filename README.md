# ng2-smart-search

The `ng2-smart-search` is component which takes two inputs, an list/array of objects to begin with and the `search` string.
It then does an intuitive search and finds out records with closest match.

For example, if the user have mistyped and typed in `Leane Grohm` and the list contains actually `Leanne Graham` which the user expects to get / which is the correct result, `Leanne Graham` will be returned as thats the closest match to the searched string. However, if `Leane Grohm` really exists in the list then `ng2-smart-search` will return both the records, `Leane Grohm` with 100% match and also `Leanne Graham` with lesser match.

This is the first draft of my project. Do fork if you like and find out places to improve.

## Setting up and Build

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.1.1.
You need to have Angular CLI version 1.1.1 to pull in the dependancies to run the project.

After downloading this project just do a `ng-install` to install the node modules and dependancies as I have not uploaded the node module to the github repo.

Do a `ng serve` for a dev server. Navigate to `http://localhost:4200/`.

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.
