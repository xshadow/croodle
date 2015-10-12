import Ember from "ember";
import EmberValidations from 'ember-validations';
/* global moment */

export default Ember.Controller.extend(EmberValidations.Mixin, {
  actions: {
    save: function(){
      // check if answer type is selected
      if (this.get('model.answerType') === null) {
        return;
      }

      // save poll
      var self = this;
      this.get('model').save().then(function(model){
        // reload as workaround for bug: duplicated records after save
        model.reload().then(function(model){
           // redirect to new poll
           self.get('target').send('transitionToPoll', model);
        });
      });
    },
    
    submit: function(){
      var self = this;
      this.validate().then(function() {
        self.send('save');
      }).catch(function(){
        Ember.$.each(Ember.View.views, function(id, view) {
          if(view.isEasyForm) {
            view.focusOut();
          }
        });
      });
    }
  },

  answerTypes: function() {
    return [
      Ember.Object.extend(Ember.I18n.TranslateableProperties, {}).create({
          id : "YesNo",
          labelTranslation : "answerTypes.yesNo.label",
          answers : [
                  this.store.createFragment('answer', {
                    type: "yes",
                    labelTranslation: "answerTypes.yes.label",
                    icon: "glyphicon glyphicon-thumbs-up"
                  }),
                  this.store.createFragment('answer', {
                    type: "no",
                    labelTranslation: "answerTypes.no.label",
                    icon: "glyphicon glyphicon-thumbs-down"
                  })
              ]
      }),
      Ember.Object.extend(Ember.I18n.TranslateableProperties, {}).create({
          id : "YesNoMaybe",
          labelTranslation : "answerTypes.yesNoMaybe.label",
          answers : [
                  this.store.createFragment('answer', {
                    type: "yes",
                    labelTranslation: "answerTypes.yes.label",
                    icon: "glyphicon glyphicon-thumbs-up"
                  }),
                  this.store.createFragment('answer', {
                    type: "maybe",
                    labelTranslation: "answerTypes.maybe.label",
                    icon: "glyphicon glyphicon-hand-right"
                  }),
                  this.store.createFragment('answer', {
                    type: "no",
                    labelTranslation: "answerTypes.no.label",
                    icon: "glyphicon glyphicon-thumbs-down"
                  })
              ]
      }),
      Ember.Object.extend(Ember.I18n.TranslateableProperties, {}).create({
          id : "FreeText",
          labelTranslation : "answerTypes.freeText.label",
          answers : []
      })
    ];
  }.property(),

  expirationDuration: 'P3M',

  expirationDurations: function() {
    return [
      Ember.Object.extend(Ember.I18n.TranslateableProperties, {}).create({
        id: 'P7D',
        labelTranslation: 'create.settings.expirationDurations.P7D'
      }),
      Ember.Object.extend(Ember.I18n.TranslateableProperties, {}).create({
        id: 'P1M',
        labelTranslation: 'create.settings.expirationDurations.P1M'
      }),
      Ember.Object.extend(Ember.I18n.TranslateableProperties, {}).create({
        id: 'P3M',
        labelTranslation: 'create.settings.expirationDurations.P3M'
      }),
      Ember.Object.extend(Ember.I18n.TranslateableProperties, {}).create({
        id: 'P6M',
        labelTranslation: 'create.settings.expirationDurations.P6M'
      }),
      Ember.Object.extend(Ember.I18n.TranslateableProperties, {}).create({
        id: 'P1Y',
        labelTranslation: 'create.settings.expirationDurations.P1Y'
      }),
      Ember.Object.extend(Ember.I18n.TranslateableProperties, {}).create({
        id: '',
        labelTranslation: 'create.settings.expirationDurations.never'
      })
    ];
  }.property(),

  /*
   * set answers depending on selected answer type
   */
  updateAnswers: function(){
    var selectedAnswer = this.get('model.answerType'),
        answers = [],
        answerTypes = this.get('answerTypes');

    if (selectedAnswer !== null) {
      for (var i=0; i < answerTypes.length; i++) {
        if (answerTypes[i].id === selectedAnswer) {
            answers = answerTypes[i].answers.map(answer => Ember.copy(answer));
        }
      }

      this.set('model.answers', answers);
    }
  }.observes('model.answerType'),

  updateExpirationDate: function() {
    var expirationDuration = this.get('expirationDuration');
    
    if(Ember.isEmpty(expirationDuration)) {
      this.set('model.expirationDate', '');
    }
    else {
      this.set('model.expirationDate',
        moment().add(
          moment.duration(expirationDuration)
        ).toISOString()
      );
    }
  }.observes('expirationDuration'),

  validations: {
    'model.anonymousUser': {
      presence: true
    },
    'model.answerType': {
      presence: true,
      inclusion: {
          in: ["YesNo", "YesNoMaybe", "FreeText"]
      }
    },
    'model.forceAnswer': {
      presence: true
    }
  }
});
