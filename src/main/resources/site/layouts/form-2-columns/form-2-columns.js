var portalLib    = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');

exports.get = function(req) {

  // Find the current component.
  var component = portalLib.getComponent();
  var config = component.config;

  // Resolve the view
  var view = resolve('form-2-columns.html');

  // Define the model
  var model = {
    component: component,
    column_1: component.regions.column_1,
    column_2: component.regions.column_2,
  };

  // Render a thymeleaf template
  var body = thymeleaf.render(view, model);

  // Return the result
  return {
    body: body,
    contentType: 'text/html'
  };

};
