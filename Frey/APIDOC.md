
Api methods
-----------

### requestRegistration
 Request new registration with given email and password.
 Approval code is returned. It is intended to be sent to provided email address.


Parameters:
* **$email** (_string_) 
* **$password** (_string_) 

Returns: _string_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### approveRegistration
 Approve registration with approval code.
 Returns new person's ID on success.


Parameters:
* **$approvalCode** (_string_) 

Returns: _int_ 

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### authorize
 Authorize person ant return permanent client-side auth token.


Parameters:
* **$email** (_string_) 
* **$password** (_string_) 

Returns: _array_ 

Exceptions:
* _AuthFailedException_ 
* _EntityNotFoundException_ 
* _\Exception_ 

### quickAuthorize
 Check if client-side token matches stored password hash.
 Useful for cookie-check.


Parameters:
* **$id** (_int_) 
* **$clientSideToken** (_string_) 

Returns: _bool_ 

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### changePassword
 Change password when old password is known.
 Returns new client-side auth token on success


Parameters:
* **$email** (_string_) 
* **$password** (_string_) 
* **$newPassword** (_string_) 

Returns: _string_ 

Exceptions:
* _AuthFailedException_ 
* _EntityNotFoundException_ 
* _\Exception_ 

### requestResetPassword
 Request password reset.
 Returns reset approval token, which should be sent over email to user.


Parameters:
* **$email** (_string_) 

Returns: _string_ 

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### approveResetPassword
 Approve password reset.
 Generates digit-code and uses it as a new password, updates all records
 and returns the code. Code should be sent to person via email, and person
 should be asked to change the password immediately.




Parameters:
* **$email** (_string_) 
* **$resetApprovalCode** (_string_) 

Returns: _string_ 

Exceptions:
* _AuthFailedException_ 
* _EntityNotFoundException_ 
* _\Exception_ 

### getAccessRules
 Primary client method, aggregating rules from groups and person.
 Get array of access rules for person in event.
 Cached for 10 minutes.


Parameters:
* **$personId** (_int_) 
* **$eventId** (_int_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### getRuleValue
 Get single rule for person in event. Hardly relies on cache.
 Also counts group rules if person belongs to one or more groups.
 Typically should not be used when more than one value should be retrieved.
 Returns null if no data found for provided person/event ids or rule name.


Parameters:
* **$personId** (_int_) 
* **$eventId** (_int_) 
* **$ruleName** (_string_) 

Returns: _mixed_ 

Exceptions:
* _\Exception_ 

### updatePersonalInfo


Parameters:
* **$id** (_string_) 
* **$title** (_string_) 
* **$country** (_string_) 
* **$city** (_string_) 
* **$email** (_string_) 
* **$phone** (_string_) 
* **$tenhouId** (_string_) 

Returns: _bool_ success

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getPersonalInfo
 Get personal info by id list.
 May or may not include private data (depending on admin rights of requesting user).


Parameters:
* **$ids** (_array_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### findByTenhouIds
 Get personal info by tenhou id list.
 May or may not include private data (depending on admin rights of requesting user).


Parameters:
* **$ids** (_array_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### findByTitle
 Fuzzy search by title.
 Query should 3 or more characters long.


Parameters:
* **$query** (_string_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 

### getGroups
 Get info of groups by id list


Parameters:
* **$ids** (_array_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getSuperadminFlag
 Client method to receive super-admin flag. Intended to be used only in Mimir/Rheda
 to determine if used has super-admin privileges independently of any event.
 Cached for 10 minutes.


Parameters:
* **$personId** (_int_) 

Returns: _bool_ 

Exceptions:
* _\Exception_ 

### getOwnedEventIds
 Get list of event IDs where specified person has admin privileges.


Parameters:
* **$personId** (_int_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### getRulesList
 Get rule list with translations to selected locale


Parameters:

Returns: _array_ 

Exceptions:
* _\Exception_ 

### getAllEventRules
 Get all access rules for event.
 - Method results are not cached!
 - To be used in admin panel, but not in client side!


Parameters:
* **$eventId** (_int_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### getPersonAccess
 Get access rules for person.
 - eventId may be null to get system-wide rules.
 - Method results are not cached!
 - To be used in admin panel, but not in client side!
 - Does not output superadmin flag


Parameters:
* **$personId** (_int_) 
* **$eventId** (_int|null_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### getGroupAccess
 Get access rules for group.
 - eventId may be null to get system-wide rules.
 - Method results are not cached!
 - To be used in admin panel, but not in client side!
 - Does not output superadmin flag


Parameters:
* **$groupId** (_int_) 
* **$eventId** (_int|null_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### getAllPersonAccess
 Get all access rules for person.
 - Method results are not cached!
 - To be used in admin panel, but not in client side!


Parameters:
* **$personId** (_int_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### getAllGroupAccess
 Get all access rules for group.
 - Method results are not cached!
 - To be used in admin panel, but not in client side!


Parameters:
* **$groupId** (_int_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### addRuleForPerson
 Add new rule for a person.




Parameters:
* **$ruleName** (_string_) 
* **$ruleValue** (_string|int|boolean_) 
* **$ruleType** (_string_) 'bool', 'int' or 'enum'
* **$personId** (_int_) 
* **$eventId** (_int_) 

Returns: _int|null_ rule id

Exceptions:
* _DuplicateEntityException_ 
* _EntityNotFoundException_ 
* _\Exception_ 

### addRuleForGroup
 Add new rule for a group.




Parameters:
* **$ruleName** (_string_) 
* **$ruleValue** (_string|int|boolean_) 
* **$ruleType** (_string_) 'bool', 'int' or 'enum'
* **$groupId** (_int_) 
* **$eventId** (_int_) 

Returns: _int|null_ rule id

Exceptions:
* _DuplicateEntityException_ 
* _EntityNotFoundException_ 
* _\Exception_ 

### updateRuleForPerson
 Update personal rule value and/or type


Parameters:
* **$ruleId** (_int_) 
* **$ruleValue** (_string|int|boolean_) 
* **$ruleType** (_string_) 'bool', 'int' or 'enum'

Returns: _bool_ success

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### updateRuleForGroup
 Update group rule value and/or type


Parameters:
* **$ruleId** (_int_) 
* **$ruleValue** (_string|int|boolean_) 
* **$ruleType** (_string_) 'bool', 'int' or 'enum'

Returns: _bool_ success

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### deleteRuleForPerson
 Drop personal rule by id


Parameters:
* **$ruleId** (_int_) 

Returns: _bool_ 

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### deleteRuleForGroup
 Drop group rule by id


Parameters:
* **$ruleId** (_int_) 

Returns: _bool_ 

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### clearAccessCache
 Clear cache for access rules of person in event.
 Warning: clearing whole cache is explicitly NOT IMPLEMENTED. When altering groups access rules,
 it's better to wait for 10mins than cause shitload on DB.


Parameters:
* **$personId** (_int_) 
* **$eventId** (_int_) 

Returns: _bool_ 

Exceptions:
* _\Exception_ 

### createAccount
 Create new account by administrator (no email checks).


Parameters:
* **$email** (_string_) 
* **$password** (_string_) 
* **$title** (_string_) 
* **$city** (_string_) 
* **$phone** (_string_) 
* **$tenhouId** (_string_) 

Returns: _int_ new account id

Exceptions:
* _\Exception_ 

### createGroup
 Create new group in admin interface
 Returns new group id


Parameters:
* **$title** (_string_) 
* **$description** (_string_) 
* **$color** (_string_) 

Returns: _int_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### updateGroup
 Update group info in admin interface


Parameters:
* **$id** (_int_) 
* **$title** (_string_) 
* **$description** (_string_) 
* **$color** (_string_) 

Returns: _bool_ success

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### deleteGroup
 Delete group and all of its linked dependencies


Parameters:
* **$id** (_int_) 

Returns: _bool_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### addPersonToGroup
 Add person to group


Parameters:
* **$personId** (_int_) 
* **$groupId** (_int_) 

Returns: _bool_ success

Exceptions:
* _EntityNotFoundException_ 
* _InvalidParametersException_ 
* _\Exception_ 

### removePersonFromGroup
 Remove person from group


Parameters:
* **$personId** (_int_) 
* **$groupId** (_int_) 

Returns: _bool_ success

Exceptions:
* _EntityNotFoundException_ 
* _InvalidParametersException_ 
* _\Exception_ 

### getPersonsOfGroup
 List persons of group


Parameters:
* **$groupId** (_int_) 

Returns: _array_ 

Exceptions:
* _EntityNotFoundException_ 
* _InvalidParametersException_ 
* _\Exception_ 

### getGroupsOfPerson
 List groups of person


Parameters:
* **$personId** (_int_) 

Returns: _array_ 

Exceptions:
* _EntityNotFoundException_ 
* _InvalidParametersException_ 
* _\Exception_ 

### addSystemWideRuleForPerson
 Add new system-wide rule for a person.




Parameters:
* **$ruleName** (_string_) 
* **$ruleValue** (_string|int|boolean_) 
* **$ruleType** (_string_) 'bool', 'int' or 'enum'
* **$personId** (_int_) 

Returns: _int|null_ rule id

Exceptions:
* _DuplicateEntityException_ 
* _EntityNotFoundException_ 
* _\Exception_ 

### addSystemWideRuleForGroup
 Add new system-wide rule for a group.




Parameters:
* **$ruleName** (_string_) 
* **$ruleValue** (_string|int|boolean_) 
* **$ruleType** (_string_) 'bool', 'int' or 'enum'
* **$groupId** (_int_) 

Returns: _int|null_ rule id

Exceptions:
* _DuplicateEntityException_ 
* _EntityNotFoundException_ 
* _\Exception_ 

