import React from 'react';
import { Router, Route, Switch } from 'dva/router';
import Map from './routes/Map'

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact component={Map} />
        <Route path="/map" exact component={Map} />
      </Switch>
    </Router>
  );
}

export default RouterConfig;
