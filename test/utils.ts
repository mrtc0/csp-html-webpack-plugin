export const TemplateHtmlWithSourcedScript = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Webpack App</title>
    <script src="analytics.js"></script>
  </head>
  <body>
    <script src="app.js"></script>
  </body>
</html>
`;

export const TemplateHtmlWithInlineScript = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Webpack App</title>
    <script src="analytics.js"></script>
  </head>
  <body>
    <script src="app.js"></script>
    <script>
        console.log("Hello World");
    </script>
  </body>
</html>
`;
