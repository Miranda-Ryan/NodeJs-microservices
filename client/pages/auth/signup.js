import React, { useState } from "react";
import useRequest from "../../hooks/useRequest";
import Router from "next/router";

const signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { doRequest, errors } = useRequest({
    url: "/api/users/signup",
    method: "post",
    body: { email, password },
    onSuccess: () => Router.push("/")
  });

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    await doRequest();
  };

  return (
    <form onSubmit={onSubmitHandler}>
      <h1>Sign Up</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {errors && errors.length > 0 ? (
        <div className="alert alert-danger">
          <h4>Oops...</h4>
          <ul className="my-0">
            {errors.map((err, index) => (
              <li key={index}>{err.message}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <button className="btn btn-primary">Sign Up</button>
    </form>
  );
};

export default signup;
