
Api methods
-----------

### requestRegistration
Parameters:
* **$email** (_string_) 
* **$password** (_string_) 

Returns: _string_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### approveRegistration
Parameters:
* **$approvalCode** (_string_) 

Returns: _int_ 

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### authorize
Parameters:
* **$email** (_string_) 
* **$password** (_string_) 

Returns: _string_ 

Exceptions:
* _AuthFailedException_ 
* _EntityNotFoundException_ 
* _\Exception_ 

### quickAuthorize
Parameters:
* **$id** (_integer_) 
* **$clientSideToken** (_string_) 

Returns: _bool_ 

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### changePassword
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
Parameters:
* **$email** (_string_) 

Returns: _string_ 

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### approveResetPassword
Parameters:
* **$email** (_string_) 
* **$resetApprovalCode** (_string_) 

Returns: _int_ 

Exceptions:
* _AuthFailedException_ 
* _EntityNotFoundException_ 
* _\Exception_ 

### getAccessRules
Parameters:
* **$personId** (_integer_) 
* **$eventId** (_integer_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### getRuleValue
Parameters:
* **$personId** (_integer_) 
* **$eventId** (_integer_) 
* **$ruleName** (_string_) 

Returns: _mixed_ 

Exceptions:
* _\Exception_ 

### updatePersonalInfo
Parameters:
* **$id** (_string_) 
* **$title** (_string_) 
* **$city** (_string_) 
* **$email** (_string_) 
* **$phone** (_string_) 
* **$tenhouId** (_string_) 

Returns: _bool_ success

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getPersonalInfo
Parameters:
* **$ids** (_array_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### findByTitle
Parameters:
* **$query** (_string_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 

### getGroups
Parameters:
* **$ids** (_array_) 

Returns: _array_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### getPersonAccess
Parameters:
* **$personId** (_integer_) 
* **$eventId** (_integer|null_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### getGroupAccess
Parameters:
* **$groupId** (_integer_) 
* **$eventId** (_integer|null_) 

Returns: _array_ 

Exceptions:
* _\Exception_ 

### addRuleForPerson
Parameters:
* **$ruleName** (_string_) 
* **$ruleValue** (_string|integer|boolean_) 
* **$ruleType** (_string_) 'bool', 'int' or 'enum'
* **$personId** (_integer_) 
* **$eventId** (_integer_) 

Returns: _integer_ rule id

Exceptions:
* _DuplicateEntityException_ 
* _EntityNotFoundException_ 
* _\Exception_ 

### addRuleForGroup
Parameters:
* **$ruleName** (_string_) 
* **$ruleValue** (_string|integer|boolean_) 
* **$ruleType** (_string_) 'bool', 'int' or 'enum'
* **$groupId** (_integer_) 
* **$eventId** (_integer_) 

Returns: _integer_ rule id

Exceptions:
* _DuplicateEntityException_ 
* _EntityNotFoundException_ 
* _\Exception_ 

### updateRuleForPerson
Parameters:
* **$ruleId** (_integer_) 
* **$ruleValue** (_string|integer|boolean_) 
* **$ruleType** (_string_) 'bool', 'int' or 'enum'

Returns: _bool_ success

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### updateRuleForGroup
Parameters:
* **$ruleId** (_integer_) 
* **$ruleValue** (_string|integer|boolean_) 
* **$ruleType** (_string_) 'bool', 'int' or 'enum'

Returns: _bool_ success

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### deleteRuleForPerson
Parameters:
* **$ruleId** (_integer_) 

Returns: _bool_ 

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### deleteRuleForGroup
Parameters:
* **$ruleId** (_integer_) 

Returns: _bool_ 

Exceptions:
* _EntityNotFoundException_ 
* _\Exception_ 

### clearAccessCache
Parameters:
* **$personId** (_integer_) 
* **$eventId** (_integer_) 

Returns: _bool_ 

### createAccount
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
Parameters:
* **$title** (_string_) 
* **$description** (_string_) 
* **$color** (_string_) 

Returns: _int_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### updateGroup
Parameters:
* **$id** (_integer_) 
* **$title** (_string_) 
* **$description** (_string_) 
* **$color** (_string_) 

Returns: _bool_ success

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### deleteGroup
Parameters:
* **$id** (_integer_) 

Returns: _bool_ 

Exceptions:
* _InvalidParametersException_ 
* _\Exception_ 

### addPersonToGroup
Parameters:
* **$personId** (_integer_) 
* **$groupId** (_integer_) 

Returns: _bool_ success

Exceptions:
* _EntityNotFoundException_ 
* _InvalidParametersException_ 
* _\Exception_ 

### removePersonFromGroup
Parameters:
* **$personId** (_int_) 
* **$groupId** (_int_) 

Returns: _bool_ success

Exceptions:
* _EntityNotFoundException_ 
* _InvalidParametersException_ 
* _\Exception_ 

### getPersonsOfGroup
Parameters:
* **$groupId** (_int_) 

Returns: _array_ 

Exceptions:
* _EntityNotFoundException_ 
* _InvalidParametersException_ 
* _\Exception_ 

### getGroupsOfPerson
Parameters:
* **$personId** (_int_) 

Returns: _array_ 

Exceptions:
* _EntityNotFoundException_ 
* _InvalidParametersException_ 
* _\Exception_ 

