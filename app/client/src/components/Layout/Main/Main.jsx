// External libraries
import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import { Grid } from "react-bootstrap";

// Containers
import OrderbookContainer from "../../../containers/Orderbook";
import CreateOrderContainer from "../../../containers/CreateOrder";
// import TokenPairsContainer from "../../../containers/TokenPairs";
import OrderContainer from "../../../containers/Order";

// Styling
import "./Main.css";



class Main extends Component {
  render() {
    return (
      <main className="Main">
        <Grid>
          <Switch>
            <Route path="/" exact={true} component={OrderbookContainer} />
            <Route path="/create" component={CreateOrderContainer} />
            {/*<Route path="/tokens" component={TokenPairsContainer} />*/}
            <Route path="/order/:hash" component={OrderContainer} />
          </Switch>
        </Grid>
      </main>
    );
  }
}

export default Main;
