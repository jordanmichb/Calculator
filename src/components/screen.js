import React from "react";
import ScreenRow from "./screenRow.js";

const Screen = (props) => {
    return (
      <div id="display">
        <ScreenRow id="answer" value={props.answer}/>
        <ScreenRow id="formula" value={props.formula}/>
      </div>
    );
}

export default Screen;