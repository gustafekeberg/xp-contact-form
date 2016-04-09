var portalLib    = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');

exports.get = function(req) {

  // Find the current component.
  var component = portalLib.getComponent();
  var config = component.config;

  // Resolve the view
  var view = resolve('/views/designer-layouts.html');

  // Define the model
  var model = {
    column_count: '3',
    component: component,
    column_1: component.regions.column_1,
    column_2: component.regions.column_2,
    column_3: component.regions.column_3,
  };

  // Render a thymeleaf template
  var body = thymeleaf.render(view, model);

  // Return the result
  return {
    body: body,
    contentType: 'text/html'
  };

};
