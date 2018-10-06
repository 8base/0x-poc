// External libraries
import React, { Component } from "react";

// Components
import Main from "./Main/Main";
import Header from "./Header/Header";

// Styling
import "./Layout.css";

class Layout extends Component {
    render() {
        return (
            <div className="Layout">
                <Header />
                <Main />
            </div>
        );
    }
}

export default Layout;
