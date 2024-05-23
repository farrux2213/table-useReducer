import { Button } from "antd";
import { useEffect, useReducer } from "react";

const action = (state, { type, payload }) => {
  switch (type) {
    case "DATA_CHANGE":
      return {
        ...state,
        data: payload.data,
      };
    case "DELETE":
      return {
        ...state,
        data: state.data.filter(({ id }) => id !== payload.id),
      };
    default:
      return state;
  }
};

const App = () => {
  const [state, dispatch] = useReducer(action, {
    data: [],
  });

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/todos"
        );
        const data = await response.json();
        dispatch({ type: "DATA_CHANGE", payload: { data } });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    getData();
  }, []);

  const onClick = async (id) => {
    dispatch({ type: "DELETE", payload: { id } });

    try {
      await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center flex-col w-full h-[100vh] gap-[15px]">
        {state.data.map(({ id, title }) => (
          <div key={id}>
            {title} <Button onClick={() => onClick(id)}>DELETE</Button>
          </div>
        ))}
      </div>
    </>
  );
};

export default App;
