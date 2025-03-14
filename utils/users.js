const users = [];

// Join user to chat
function userJoin(id, room, username) {
  const user = { id, room, username };

  users.push(user);
  console.log(users);
  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}
export { userJoin, getCurrentUser, userLeave, getRoomUsers };
