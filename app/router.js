import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function(){
  this.route('poll', { path: '/poll/:poll_id' });
  this.resource('create', function(){
    this.route('meta');
    this.route('options');
    this.route('options-datetime');
    this.route('settings');
  });
  this.route('404');
});

export default Router;
