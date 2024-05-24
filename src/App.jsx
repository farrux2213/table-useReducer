import React, {
  useContext,
  useEffect,
  useRef,
  useReducer,
  useState,
} from "react";
import { Button, Form, Input, Popconfirm, Table } from "antd";
import "./App.css";

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} is required.` }]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const initialState = {
  dataSource: [],
  count: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_ROW":
      const newData = {
        key: state.count,
        name: [],
        address: [],
        completed: false,
      };
      return {
        ...state,
        dataSource: [...state.dataSource, newData],
        count: state.count + 1,
      };
    case "DELETE_ROW":
      return {
        ...state,
        dataSource: state.dataSource.filter(
          (item) => item.key !== action.payload
        ),
      };
    case "SAVE_ROW":
      const newDataSource = [...state.dataSource];
      const index = newDataSource.findIndex(
        (item) => item.key === action.payload.key
      );
      const item = newDataSource[index];
      newDataSource.splice(index, 1, { ...item, ...action.payload });
      return {
        ...state,
        dataSource: newDataSource,
      };
    case "DATA_CHANGE":
      return {
        ...state,
        dataSource: action.payload.data.map((item, idx) => ({
          key: idx,
          ...item,
        })),
        count: action.payload.data.length,
      };
    default:
      return state;
  }
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

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

  const handleDelete = (key) => {
    dispatch({ type: "DELETE_ROW", payload: key });
  };

  const handleAdd = () => {
    dispatch({ type: "ADD_ROW" });
  };

  const handleSave = (row) => {
    dispatch({ type: "SAVE_ROW", payload: row });
  };

  const defaultColumns = [
    {
      title: "ID",
      dataIndex: "id",
      width: "20%",
      editable: true,
    },
    {
      title: "Title",
      dataIndex: "title",
      width: "50%",
      editable: true,
    },
    {
      title: "Completed",
      dataIndex: "completed",
      width: "20%",
      render: (completed) => (completed ? "Yes" : "No"),
    },
    {
      title: "Operation",
      dataIndex: "operation",
      render: (_, record) =>
        state.dataSource.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record.key)}
          >
            <a>Delete</a>
          </Popconfirm>
        ) : null,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  return (
    <div>
      <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
        Add a row
      </Button>
      <Table
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        dataSource={state.dataSource}
        columns={columns}
      />
    </div>
  );
};

export default App;
