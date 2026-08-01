Here are source code of garfana business text panel plugins.

Prerequisites :
Grafana dashboard
Business text panel plugins downloaded and installed : [Clickable Text](https://grafana.com/grafana/plugins/marcusolsson-dynamictext-panel/)

On a Dashboard Editor menu grafana > Add Visualization > Change the visualization type : Business Text

Panel Settings Steps:
1. Panel Options : Delete the panel title, enable transparent background
2. Business Text : Render Template = All Data, Select Editors to display = JavaScript code after content ready & Styles
3. Editor : Primary Content Language = HTML
4. Content : Wrap Automatically in paragraphs = Disabled

Once you set the "select editors to display" (on step 2) 2 new editor panels will appear (Javascript and CSS Styles panel)

content panel = html, JavaScript panel = Javascript, CSS Styles panel = CSS

For this repository there are 3 examples of panels that has been configured. for each type of panels copy the code according the filename :
content.html = copy to Content panel
AfterReadyContent.js = copy to Javascript panel
style.css = copy to CSS Styles panel
