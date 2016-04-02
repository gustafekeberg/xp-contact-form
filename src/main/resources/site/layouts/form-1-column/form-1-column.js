var portalLib    = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');

exports.get = function(req) {

  // Find the current component.
  var component = portalLib.getComponent();
  var config = component.config;

  // Resolve the view
  var view = resolve('form-1-column.html');

  // Define the model
  var model = {
    component: component,
    column: component.regions.column,
  };

  // Render a thymeleaf template
  var body = thymeleaf.render(view, model);

  // Return the result
  return {
    body: body,
    contentType: 'text/html'
  };

};
