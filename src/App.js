import election from './assets/images/election.png';
import './App.css';
import React, { useEffect, useState } from 'react';
import { Table, Input, InputNumber, Popconfirm, Form, Typography, Button, Modal, Select } from 'antd';
import xlsx from 'json-as-xlsx';
const originData = [];


const { Option } = Select;


for (let i = 1; i <= 100; i++) {
  originData.push({
    key: i.toString(),
    name: ``,
    birthday: '',
    gender: '',
    vote: 0
  });
}

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  let inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  if (inputType === 'selectBox') {
    inputNode = <Select defaultValue="">
      <Option value="Nam">Nam</Option>
      <Option value="Nữ">Nữ</Option>
    </Select>
  }
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Xin vui lòng nhập ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};


function App() {
  const [form] = Form.useForm();
  const [data, setData] = useState(originData);
  const [resultData, setResultData] = useState([]);
  const [isShowResult, setIsShowResult] = useState(false);
  const [editingKey, setEditingKey] = useState('');

  useEffect(() => {
    const existedData = JSON.parse(localStorage.getItem('data') || 'null');
    if (existedData) {
      setData(existedData);
    }
  }, []);

  const clearVotes = () => {
    const newData = [...data].map(x => ({ ...x, vote: 0 }));
    setData(newData);
    localStorage.setItem('data', JSON.stringify(newData));
  }

  const clearAllData = () => {
    const newData = [...data].map(x => ({ ...x, name: '', birthday: '', gender: '', vote: 0 }));
    setData(newData);
    localStorage.removeItem('data');
  }

  const isEditing = (record) => record.key === editingKey;

  const showResult = () => {
    const newResutData = [...data].sort((a, b) => b.vote - a.vote);
    setResultData(
      newResutData.map((x, index) => {
        return {
          ...x,
          key: index + 1
        }
      }));
    setIsShowResult(true);
  };

  const exportResult = () => {
    const newResutData = [...data].sort((a, b) => b.vote - a.vote).filter(x => x.name);
    const sheetData = [
      {
        sheet: 'Kết quả bầu cử Ban Chấp Sự',
        columns: [
          { label: 'STT', value: 'key' },
          { label: 'Họ và Tên', value: 'name' },
          { label: 'Năm Sinh', value: 'birthday' },
          { label: 'Giới Tính', value: 'gender' },
          { label: 'Số Phiếu Bầu', value: 'vote' },
        ],
        content: newResutData.map((x, index) => ({ ...x, key: index + 1, vote: parseInt(x.vote) || 0 }))
      }
    ]

    let settings = {
      fileName: 'Ket-qua-bau-cu-Ban-Chap-Su',
      extraLength: 3,
      writeOptions: {} // Style options from https://github.com/SheetJS/sheetjs#writing-options
    }

    xlsx(sheetData, settings);
  }

  const edit = (record) => {
    form.setFieldsValue({
      name: '',
      vote: '',
      birthday: '',
      gender: '',
      ...record,
    });
    setEditingKey(record.key);
  };

  const addVote = (record) => {
    const newData = [...data];
    const index = newData.findIndex((item) => record.key === item.key);

    if (index > -1) {
      const item = {
        ...newData[index],
        vote: (record?.vote || 0) + 1
      }
      newData[index] = item;
      setData(newData);
      localStorage.setItem('data', JSON.stringify(newData));
    }
  }

  const subtractVote = (record) => {
    const newData = [...data];
    const index = newData.findIndex((item) => record.key === item.key);

    if (index > -1) {
      const item = {
        ...newData[index],
        vote: record?.vote > 0 ? record?.vote - 1 : 0
      }
      newData[index] = item;
      setData(newData);
      localStorage.setItem('data', JSON.stringify(newData));
    }
  }

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }

      localStorage.setItem('data', JSON.stringify(newData));
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'key', //address
      width: '20px',
      editable: false,
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'name',
      width: '35%',
      editable: true,
    },
    {
      title: 'Năm Sinh',
      dataIndex: 'birthday',
      width: '7.5%',
      editable: true,
    },
    {
      title: 'Giới Tính',
      dataIndex: 'gender',
      width: '7.5%',
      editable: true
    },
    {
      title: 'Số Phiếu Bầu',
      dataIndex: 'vote', //age
      width: '20%',
      editable: true
    },
    {
      title: 'Bầu Chọn',
      dataIndex: 'voteAction', //operation
      render: (_, record) => {
        return (
          <Typography.Link>
            <Button type="primary" onClick={() => addVote(record)}>+</Button>
            <Button type="danger" onClick={() => subtractVote(record)} style={{ marginLeft: '10px' }}>-</Button>
          </Typography.Link>
        )
      },
    },
    {
      title: 'Chỉnh Sửa',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{
                marginRight: 8,
              }}
            >
              Lưu
            </Typography.Link>
            <Popconfirm title="Xác nhận hủy?" onConfirm={cancel}>
              <a>Hủy</a>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
            Thay đổi
          </Typography.Link>
        );
      },
    }
  ];

  const resultColumns = [
    {
      title: 'STT',
      dataIndex: 'key', //address
      width: '5%',
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'name',
      width: '55%',
    },
    {
      title: 'Năm Sinh',
      dataIndex: 'birthday',
      width: '10%',
    },
    {
      title: 'Giới Tính',
      dataIndex: 'gender',
      width: '10%',
    },
    {
      title: 'Số Phiếu Bầu',
      dataIndex: 'vote', //age
      width: '20%'
    }
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    const numFields = ['birthday', 'vote'];

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: numFields.includes(col.dataIndex) ? 'number' : col.dataIndex === 'gender' ? 'selectBox' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  return (
    <div className='content'>
      <div className='logo'>
        <img src={election} width="42%" />
      </div>
      <div className='header'>
      </div>

      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
          }}
          className="table-data"
          size="small"

        />

        <Modal title="KẾT QUẢ" visible={isShowResult} onOk={() => setIsShowResult(false)} onCancel={() => setIsShowResult(false)} width="70%">
          <Table columns={resultColumns} dataSource={resultData} className="result-table" />
        </Modal>

        <Button onClick={showResult}>Xem kết quả</Button>
        <Button onClick={exportResult}>Xuất kết quả</Button>
        <Button>
          <Popconfirm title="Xác nhận xóa?" onConfirm={clearVotes}>
            <a>Xóa tất cả phiếu bầu</a>
          </Popconfirm>
        </Button>
        <Button>
          <Popconfirm title="Xác nhận xóa?" onConfirm={clearAllData}>
            <a>Xóa tất cả dữ liệu</a>
          </Popconfirm>
        </Button>
      </Form>
    </div>
  );
}

export default App;