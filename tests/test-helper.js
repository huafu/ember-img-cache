import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-qunit';

setResolver(resolver);

document.write('<div id="ember-testing-container"><div id="ember-testing"></div></div>');

QUnit.config.urlConfig.push({ id: 'showcontainer', label: 'Show container'});
var containerVisibility = QUnit.urlParams.showcontainer ? 'visible' : 'hidden';
document.getElementById('ember-testing-container').style.visibility = containerVisibility;
