import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../components/Auth";

/**
 * A helper function for below
 */
function axiosGet(url, token, requiresAuth) {
  if (!token || !requiresAuth) return axios.get(url);
  return axios.get(url, { headers: { authorization: `Bearer ${token}` } });
}

/**
 * A custom hook which fetches data from the given URL. Includes functionality to determine
 * whether the data is still being loaded or not.
 *
 * Compared to the hook demonstrated in lectures, the only difference with this one is that
 * you can configure the GET requests to require auth (or not) using the requiresAuth arg.
 */
export default function useGet(url, options = { initialState: null, requiresAuth: false }) {
  const [data, setData] = useState(options.initialState ?? null);
  const [isLoading, setLoading] = useState(true);
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosGet(url, token, !!options.requiresAuth);
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [url, refreshToggle]);

  function refresh() {
    setRefreshToggle(!refreshToggle);
  }

  /**
   * Data: The data being fetched, or initialState if nothing's fetched yet
   * isLoading: True if the request is underway, false otherwise
   * error: null if no errors are detected. Otherwise, this will be an object describing the error.
   * refresh(): A function that can be called to re-send the request.
   */
  return { data, isLoading, error, refresh };
}
