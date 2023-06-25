# Live Market Indicator

An options market indicator created for Financial club, The Goose Group. Connects Node.js server to Client JavaScript.

## Major Versions

### [Version 0.1](https://github.com/MrSchaffner/Code-Summary/tree/master/Market_Indicator_CodeSummary/SpyGlass_v1)

* Used Javascript to consume market APIs in Websocket and RESTful form
* Implemented MVC Separation
* Processed live market data
* Displayed data in readable form with Chart APIs
* Invented Market Symbol eta (Greek H) for Hedge Impact (Half Joking)
* Calls = Canary Yellow | Puts = Pink | Both = Blue

<img
  src="https://github.com/MrSchaffner/Code-Summary/blob/master/Images_Display/spyglass_v1.png"
  alt="Spyglass Version 1 Image"
  style="display: inline-block; margin: 0 auto; max-width: 300px">

### [Version 2.0](https://github.com/MrSchaffner/Code-Summary/tree/master/Market_Indicator_CodeSummary/SpyGlass_v2)

* Separated out program into Node.js Server (Controller + Model) & Javscript Client (View + Controller).
* Node.js server consumed Sockets and RESTful APIs. Data was stored on server and then hosted and sent to Client using websocket messages. 
* Separation improved multithreading and sped up program considerably. 
* Upgraded certain graphs away from Google Charts for speed and more aesthetic options.

<img
  src="https://github.com/MrSchaffner/Code-Summary/blob/master/Images_Display/spyglass_v2.jpg"
  alt="Spyglass Version 1 Image"
  style="display: inline-block; margin: 0 auto; max-width: 300px">

```bash
<script>
    alert("hello universe!");
</script>
```
