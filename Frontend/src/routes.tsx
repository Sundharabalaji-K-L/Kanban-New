import React from 'react';
import { Route, Switch } from 'react-router-dom';
import KanbanBoard from "./Pages/KanbanBoard";
import MentorKanban from "./Pages/MentorKanbanBoard";
import AdminKanbanBoard from "./Pages/AdminKanbanBoard";


const AppRoutes: React.FC = () => {
  return (
    <Switch>
        <Route exact path="/" component={KanbanBoard} />
        <Route exact path="/mentor" component={MentorKanban} />
        <Route exact path="/admin" component={AdminKanbanBoard} />

    </Switch>
  );
};

export default AppRoutes;