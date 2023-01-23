import { useState } from "react";
import axios from "axios";

const useRequest = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (props = {}) => {
    try {
      setErrors(null);
      const response = await axios[method](url, {
        ...body,
        ...props
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setErrors(error.response.data.errors);
    }
  };

  return { doRequest, errors };
};

export default useRequest;
