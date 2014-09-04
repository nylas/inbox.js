/**
 * @class INContact
 * @constructor
 * @augments INModelObject
 *
 * @description
 * Represents a contact.
 */
function INContact(inbox, id, namespaceId) {
  INModelObject.call(this, inbox, id, namespaceId);
}

inherits(INContact, INModelObject);


/**
 * @function
 * @name INContact#resourceName
 *
 * @description
 * Returns the name of the resource used when constructing URLs
 *
 * @returns {string} the resource path of the file.
 */
INContact.prototype.resourceName = function() {
  return 'contacts';
};


/**
 * @property
 * @name INContact#email
 *
 * The email for the contact.
 */


/**
 * @property
 * @name INContact#name
 *
 * The name of the contact.
 */

/**
 * @property
 * @name INMessage#object
 *
 * The resource type, always 'message'.
 */
defineResourceMapping(INContact, {
  'name': 'name',
  'email': 'email'
});
