import React from 'react';
import {useLDflexList} from '@solid/react';
//import { GetUserName, GetUserFriends, GetNumberOfFriends, GetUserFriendsName} from '../../data-access/UserData';


/** Displays a list of items matching a Solid LDflex expression. */
export default function List({
  src, offset = 0, limit = Infinity, filter = () => true,
  container = items => <ul>{items}</ul>,
  children = (item, index) => <li key={index}>{`${item}`}</li>,
}) {
  const items = useLDflexList(src)
    .filter(filter)
    .slice(offset, +offset + +limit)
    .map(children);
  return container ? container(items) : items;
}