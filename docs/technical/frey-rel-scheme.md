### Frey relational schema

Entities:

- *Person*: representation of single user data, one per row.
  - Connected to *Group* via `person_group` many-to-many relation
- *Group*: representation of group of users. Used to simplify ACL rules.
  - Connected to *Person* via `person_group` many-to-many relation
- *PersonAccess*: representation of a single ACL rule related to the person.
  - Connected to *Person* via foreign key
- *GroupAccess*: representation of a single ACL rule related to the group.
  - Connected to *Group* via foreign key
