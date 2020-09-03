package com.miros.ArbiterReact.enitities;

import net.minidev.json.annotate.JsonIgnore;

import javax.persistence.*;
import java.util.Objects;

// curl POST a user:
// curl -X POST localhost:8080/users -d "{\"name\": \"Boromir\", \"password\": \"agath\", \"description\": \"Shield Bearer\"}" -H "Content-Type:application/json"

// ??
// curl -i -H "Content-Type:application/json" -d "{\"name\": \"Frodo\", \"password\": \"afa\", \"roles\": \"ENGINEER\"}" "http://localhost:8080/users"

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;
    private @Version @JsonIgnore
    Long version;
    private String name;
    private String password;
    private String roles;
    private String description;

    public User() { }

    public User(String name, String password, String roles) {
        this.name = name;
        this.password = password;
        this.roles = roles;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public User(String name) {
        this.name = name;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRoles() {
        return roles;
    }

    public void setRoles(String roles) {
        this.roles = roles;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return id == user.id &&
                version.equals(user.version) &&
                name.equals(user.name) &&
                password.equals(user.password) &&
                roles.equals(user.roles) &&
                description.equals(user.description);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, password, roles, description);
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", password='" + password + '\'' +
                ", roles='" + roles + '\'' +
                ", description='" + description + '\'' +
                ", version='" + version + '\'' +
                '}';
    }
}
