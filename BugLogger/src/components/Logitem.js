import React from 'react';
import { Button, Badge } from 'react-bootstrap';
import Moment from 'react-moment';
const LogItem = (props) => {
  const { _id, priority, text, user, created } = props.logData;

  const handleDelete = () => {
    props.deleteLog(_id);
  };
  const setBadgeVariant = () => {
    if (priority === 'high') {
      return 'danger';
    } else if (priority === 'moderate') {
      return 'warning';
    } else {
      return 'success';
    }
  };
  return (
    <tr>
      <td>
        <Badge variant={setBadgeVariant()} className='p-2'>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Badge>
      </td>
      <td>{text}</td>
      <td>{user}</td>
      <td>
        <Moment format='MMMM Do YYYY, h:mm:ss a'>
          {created.toDateString()}
        </Moment>
      </td>
      <td>
        <Button variant='danger' onClick={handleDelete} size='sm'>
          X
        </Button>
      </td>
    </tr>
  );
};
export default LogItem;
