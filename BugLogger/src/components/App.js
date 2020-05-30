import React, { useState, useEffect } from 'react';
import { Container, Table, Alert } from 'react-bootstrap';
import uuid from 'uuid/dist/v1';
import axios from 'axios';
import LogItem from './Logitem';
import AddLogItem from './AddLogItem';
import { ipcRenderer } from 'electron';

axios.defaults.baseURL = 'https://buglogger-5124f.firebaseio.com/';
const App = () => {
  const [logs, setLog] = useState([]);
  useEffect(() => {
    axios
      .get('logs.json')
      .then((result) => {
        const arr = [];
        Object.keys(result.data).map(function (key) {
          arr.push({
            key,
            _id: result.data[key]._id,
            priority: result.data[key].priority,
            text: result.data[key].text,
            user: result.data[key].user,
            created: new Date(result.data[key].created),
          });
        });
        setLog(arr);
      })
      .catch((err) => {
        showAlert(err.message, 'danger');
      });
  }, []);
  const [balert, setAlert] = useState({
    show: false,
    message: '',
    variant: 'success',
  });
  const addLog = (log) => {
    if (log.text === '' || log.user === '' || log.priority === '') {
      showAlert('Please fill all fields', 'danger');
      return false;
    }
    log._id = uuid();
    log.created = new Date();
    axios
      .post('logs.json', log)
      .then((result) => {
        setLog([...logs, log]);
        showAlert('Log Added');
      })
      .catch((err) => {
        showAlert(err.message, 'danger');
      });
  };
  const showAlert = (message, variant = 'success', ms = 3000) => {
    setAlert({
      show: true,
      message,
      variant,
    });
    setInterval(() => {
      setAlert({
        show: false,
        message: '',
        variant: 'success',
      });
    }, ms);
  };
  ipcRenderer.on('clearLog', (e, data) => {
    axios
      .delete('logs/.json')
      .then((result) => {
        setLog([]);
        showAlert('All Log Deleted', 'danger');
      })
      .catch((err) => {
        showAlert(err.message, 'danger');
      });
  });

  const handleDeleteLog = (id) => {
    axios
      .delete('logs/' + logs.find((x) => x._id === id).key + '.json')
      .then((result) => {
        setLog(logs.filter((x) => x._id !== id));
        showAlert('Log Deleted', 'danger');
      })
      .catch((err) => {
        showAlert(err.message, 'danger');
      });
  };
  return (
    <Container>
      <AddLogItem addLog={addLog} />
      {balert.show && <Alert variant={balert.variant}>{balert.message}</Alert>}
      <Table>
        <thead>
          <tr>
            <th>Priority</th>
            <th>Log Text</th>
            <th>User</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td>No logs. Please start adding them.</td>
            </tr>
          ) : (
            logs.map((log) => (
              <LogItem
                key={log._id}
                logData={log}
                deleteLog={handleDeleteLog}
              />
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default App;
