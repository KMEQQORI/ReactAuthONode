import React from "react";
import auth0Client from "./Auth";

function Profile(props) {
  return (
    <div className="container">
      <div className="row">
        <div className="jumbotron col-12">
          {auth0Client.isAuthenticated() &&
            JSON.stringify(auth0Client.getProfile())}
        </div>
      </div>
    </div>
  );
}

export default Profile;
