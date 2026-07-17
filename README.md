# Coffee Counter

Ever went at the bar with a group of friends and found yourself struggling to keep track of everyone's coffee orders? This web application is here to help!

Coffee Counter tracks and aggregates group coffee orders into a compiled, easily copyable text summary.

## Features

- An interactive menu with predefined coffee choices (for Italian folks, mostly) and the ability to add custom entries:
  - Liscio, Macchiato, Lungo, Cappuccino, Latte macchiato, Americano, Tè, Caffè d'orzo, Crema caffè.
- Dynamic variations for each drink type, including decaf (*deca*), soy milk (*soia*), no plate (*brutto*), and size selections for the crema caffè (*piccola/grande*).
- Responsive SVGs that change colors and sizes based on the selected beverage.

Once you are satisfied with your order, you can copy the finalized count directly to your clipboard with a single click.

Can't decide who pays? The **Chi paga?** button draws a random cup from the order (every cup counts as one raffle ticket). If the drawn drink appears more than once, the app rolls a count-off, for example *"counting clockwise from whoever is closest to the counter, number 2 pays"*

## Run it

Because this project is built entirely with basic web technologies, there are no compilers, dependencies, or build scripts needed:

1. Clone or download this repository to your computer.
2. Double-click or open the `index.html` file in any modern web browser.
