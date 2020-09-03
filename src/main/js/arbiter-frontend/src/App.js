// const React = require("react");
const ReactDOM = require("react-dom");
const axios = require("axios");
import React, { useState } from "react";

import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";

const root = "/users";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { users: [], properties: [], pageSize: 2, links: {} };
    this.updatePageSize = this.updatePageSize.bind(this);
    this.onCreate = this.onCreate.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    // this.onNavigate = this.onNavigate.bind(this);
    this.loadFromServer = this.loadFromServer.bind(this);
  }

  componentDidMount() {
    console.log("compdidMount");
    this.loadFromServer(this.state.pageSize);
  }

  loadFromServer(
    pageSize = 2,
    navLink = `${root}?size=${this.state.pageSize}`
  ) {
    console.log(pageSize + " " + navLink);
    axios({
      method: "get",
      url: navLink, // root + "?size=" + this.pageSize
    })
      .then((userCollection) => {
        console.log("userCollection1");
        console.log(userCollection);
        return axios({
          method: "GET",
          url: userCollection.data._links.profile.href,
          headers: { Accept: "application/schema+json" },
        }).then((schema) => {
          console.log("schema");
          console.log(schema);
          this.schema = schema.data;
          return userCollection;
        });
      })
      .then((userCollection) => {
        console.log("UseCol");
        console.log(userCollection);
        this.links = userCollection.data._links;
        return userCollection.data._embedded.users.map((user) =>
          axios({
            method: "GET",
            url: user._links.self.href,
          })
        );
      })
      .then((userPromises) => {
        console.log("userPromises");
        console.log(userPromises);
        return Promise.all(userPromises);
      })
      .then((userPromises) => {
        console.log("userPromises");
        console.log(userPromises);
        this.setState({
          users: userPromises,
          properties: Object.keys(this.schema.properties),
          pageSize: pageSize,
          links: this.links,
        });
      });
  }

  onCreate(newUser) {
    return axios({
      method: "get",
      url: "/users",
    })
      .then((userCollection) => {
        axios({
          method: "post",
          url: userCollection.data._links.self.href,
          data: newUser,
          headers: { "Content-Type": "application/json" },
        });
      })
      .then(this.loadFromServer(this.state.pageSize));
  }

  onDelete(user) {
    axios.delete(user.data._links.self.href).then((response) => {
      console.log("On delete " + response);
      console.log(user.data._links.self.href);
      this.loadFromServer(this.state.pageSize);
    });
  }

  onUpdate(user, updatedUser) {
    console.log(user);
    axios({
      method: "PUT",
      url: user.data._links.self.href,
      data: updatedUser,
      headers: {
        "Content-Type": "application/json",
        "If-Match": user.headers.etag,
      },
    })
      .catch((error) => {
        console.log(error.response);
        if (error.response.status === 412) {
          // Fix the then.catch promises
          console.log("STALE COPY");
          alert(
            "DENIED: Unable to update " +
              user.data.name +
              ". Your copy is stale."
          );
        }
      })
      .then((response) => {
        this.loadFromServer(this.props.pageSize);
        console.log("Second then");
        console.log(response);
      });
  }

  // onNavigate(navUri) {
  //   console.log("onNav");
  //   axios.get(navUri).then((userCollection) => {
  //     console.log(userCollection);
  //     this.setState({
  //       users: userCollection.data._embedded.users,
  //       properties: this.state.properties,
  //       pageSize: this.state.pageSize,
  //       links: userCollection.data._links,
  //     });
  //   });
  // }

  updatePageSize(pageSize) {
    if (pageSize !== this.state.pageSize) {
      this.state.pageSize = pageSize;
      this.loadFromServer(pageSize);
    }
  }

  render() {
    console.log(this.state.links);
    return (
      <div>
        <CreateDialog
          properties={this.state.properties}
          onCreate={this.onCreate}
        />
        <UserList
          users={this.state.users}
          links={this.state.links}
          pageSize={this.state.pageSize}
          // onNavigate={this.onNavigate}
          onDelete={this.onDelete}
          updatePageSize={this.updatePageSize}
          onCreate={this.onCreate}
          onUpdate={this.onUpdate}
          loadFromServer={this.loadFromServer}
        />
      </div>
    );
  }
}

// const styleApp = {
//   background: "#f4f4f4",
//   position: "centered",
//   padding: "20px",
// };

class UpdateDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
    console.log("Props on Update");
    console.log(this.props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setShow = this.setShow.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const updatedUser = {};
    console.log(this.props);
    this.props.properties.forEach((property) => {
      updatedUser[property] = ReactDOM.findDOMNode(
        this.refs[property]
      ).value.trim();
    });
    this.props.onUpdate(this.props.user, updatedUser);
    window.location = "#";
  }

  setShow() {
    this.setState({ show: !this.state.show });
  }

  render() {
    const inputs = this.props.properties.map((attribute) => (
      <p key={this.props.user.data[attribute]}>
        <input
          type="text"
          placeholder={attribute}
          defaultValue={this.props.user.data[attribute]}
          ref={attribute}
          className="field"
        />
      </p>
    ));

    const dialogId = "updateUser-" + this.props.user.data._links.self.href;

    return (
      <>
        <Button variant="primary" onClick={this.setShow}>
          Update
        </Button>

        <Modal
          show={this.state.show}
          onHide={this.setShow}
          id={dialogId}
          key={this.props.user.data._links.self.href}
        >
          <Modal.Header closeButton>
            <Modal.Title>Update User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {inputs}
              <Button
                onClick={this.handleSubmit}
                variant="primary"
                type="submit"
              >
                Update
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </>
    );
  }
}

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.handleNavLast = this.handleNavLast.bind(this);
    this.handleNavNext = this.handleNavNext.bind(this);
    this.handleNavPrev = this.handleNavPrev.bind(this);
    this.handleNavFirst = this.handleNavFirst.bind(this);
    this.handleInput = this.handleInput.bind(this);
    console.log("UserList props: ");
    console.log(this.props);
  }

  handleNavFirst(e) {
    e.preventDefault();
    this.props.loadFromServer(this.pageSize, this.props.links.first.href);
  }

  handleNavPrev(e) {
    e.preventDefault();
    this.props.loadFromServer(this.pageSize, this.props.links.prev.href);
  }

  handleNavNext(e) {
    e.preventDefault();
    console.log(this.props.links);
    this.props.loadFromServer(this.pageSize, this.props.links.next.href);
  }

  handleNavLast(e) {
    e.preventDefault();
    this.props.loadFromServer(this.pageSize, this.props.links.last.href);
  }

  handleInput(e) {
    e.preventDefault();
    const pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
    if (/^[0-9]+$/.test(pageSize)) {
      this.props.updatePageSize(pageSize);
    } else {
      ReactDOM.findDOMNode(this.refs.pageSize).value = pageSize.substring(
        0,
        pageSize.length - 1
      );
    }
  }

  render() {
    const users = this.props.users.map((user) => (
      <User
        key={user.data._links.self.href}
        user={user}
        onDelete={this.props.onDelete}
        onUpdate={this.props.onUpdate}
        pageSize={this.props.pageSize}
      />
    ));
    const navLinks = [];

    console.log("Nav Links");
    console.log(this.props);
    if ("first" in this.props.links) {
      navLinks.push(
        <button key="first" onClick={this.handleNavFirst}>
          &lt;&lt;
        </button>
      );
    }
    if ("prev" in this.props.links) {
      navLinks.push(
        <button key="prev" onClick={this.handleNavPrev}>
          &lt;
        </button>
      );
    }
    if ("next" in this.props.links) {
      navLinks.push(
        <button key="next" onClick={this.handleNavNext}>
          &gt;
        </button>
      );
    }
    if ("last" in this.props.links) {
      navLinks.push(
        <button key="last" onClick={this.handleNavLast}>
          &gt;&gt;
        </button>
      );
    }

    return (
      <div>
        <input
          ref="pageSize"
          defaultValue={this.props.pageSize}
          onInput={this.handleInput}
        />
        <Table striped bordered hover>
          <tbody>
            <tr>
              <th>Name</th>
              <th>Password</th>
              <th>Description</th>
              <th>Role</th>
              <th>Delete</th>
            </tr>
            {users}
          </tbody>
        </Table>
        <div>{navLinks}</div>
      </div>
    );
  }
}

class User extends React.Component {
  constructor(props) {
    super(props);
    this.handleDelete = this.handleDelete.bind(this);
    console.log("props USER");
    console.log(this.props);
  }

  handleDelete() {
    console.log("del user");
    console.log(this.props.user);
    this.props.onDelete(this.props.user);
  }

  render() {
    return (
      <tr>
        <td>{this.props.user.data.name}</td>
        <td>{this.props.user.data.password}</td>
        <td>{this.props.user.data.description}</td>
        <td>{this.props.user.data.roles} </td>
        <td>
          <UpdateDialog
            user={this.props.user}
            properties={Object.keys(this.props.user.data)}
            onUpdate={this.props.onUpdate}
            pageSize={this.props.pageSize}
            onUpdate={this.props.onUpdate}
          />
        </td>
        <td>
          <button onClick={this.handleDelete}>Delete</button>
        </td>
      </tr>
    );
  }
}

class CreateDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setShow = this.setShow.bind(this);
    console.log(this.props);
  }

  setShow() {
    this.setState({ show: !this.state.show });
  }

  handleSubmit(e) {
    e.preventDefault();
    const newUser = {};
    console.log(this.props.properties.length);
    this.props.properties.forEach((property) => {
      newUser[property] = ReactDOM.findDOMNode(
        this.refs[property]
      ).value.trim();
    });
    console.log(newUser);
    this.props.onCreate(newUser);

    // clear out the dialog's inputs
    this.props.properties.forEach((property) => {
      ReactDOM.findDOMNode(this.refs[property]).value = "";
    });

    // Navigate away from the dialog to hide it.
    window.location = "#";
    this.setShow();
  }

  render() {
    const inputs = this.props.properties.map((property) => (
      <p key={property}>
        <input
          type="text"
          placeholder={property}
          ref={property}
          className="field"
        />
      </p>
    ));

    return (
      <>
        <Button variant="primary" onClick={this.setShow}>
          Create new User
        </Button>

        <Modal show={this.state.show} onHide={this.setShow} id="CreateUser">
          <Modal.Header closeButton>
            <Modal.Title>Create User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {inputs}
              <Button
                onClick={this.handleSubmit}
                variant="primary"
                type="submit"
              >
                Create
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </>
    );

    // return (
    //   <div>
    //     <a href="#createUser">Create</a>

    //     <div id="createUser" className="modalDialog">
    //       <div>
    //         <a href="#" title="Close" className="close">
    //           X
    //         </a>

    //         <h2>Create new user</h2>

    //         <form>
    //           {inputs}
    //           <button onClick={this.handleSubmit}>Create</button>
    //         </form>
    //       </div>
    //     </div>
    //   </div>
    // );
  }
}

export default App;

ReactDOM.render(<App />, document.getElementById("react"));
