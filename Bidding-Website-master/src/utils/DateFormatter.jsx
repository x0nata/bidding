import React from "react";
import Moment from "react-moment";

export const DateFormatter = ({ date }) => {
  return (
    <>
      <Moment format="D MMM YYYY" withTitle>
        {date}
      </Moment>
    </>
  );
};
