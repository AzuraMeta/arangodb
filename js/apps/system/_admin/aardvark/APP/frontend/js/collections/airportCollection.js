/*jshint browser: true */
/*jshint unused: false */
/*global window, Backbone, $, _ */
(function () {

  "use strict";

  window.Airports = Backbone.Collection.extend({

    initialize: function() {
    },

    getAirports: function(callback) {
      var self = this;

      $.ajax({
        type: "POST",
        url: "/_api/cursor",
        data: JSON.stringify({
          query: "for a in airports return {Latitude: a.Latitude, " +
                 "Longitude: a.Longitude, Name: a.Name, City: a.City, _key: a._key}"
        }),
        contentType: "application/json",
        processData: false,
        success: function (data) {
          _.each(data.result, function(airport) {
            self.add(airport);
          });
          if (callback) {
            callback();
          }
        },
        error: function (data) {
        }
      });
    },

    getFlightsForAirport: function(airport, callback) {
      var self = this;

      $.ajax({
        type: "POST",
        url: "/_api/cursor",
        data: JSON.stringify({
          query: "for f in flights12 filter f.Origin == @airport COLLECT dest = f.Dest " + 
                 "WITH COUNT INTO n SORT n RETURN {Dest: dest, count: n}",
          bindVars: {"airport": airport}
        }),
        contentType: "application/json",
        processData: false,
        success: function (data) {
          callback(data.result);
        },
        error: function (data) {
        }
      });
    },

    model: window.Airport

  });
}());
