import Ember from 'ember';
import { img } from 'ember-img-cache/helpers/img';

Ember.Handlebars.registerBoundHelper('img', img);

export default {
  name:       'ember-img-cache',
  initialize: Ember.K
};
