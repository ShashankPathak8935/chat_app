import React from 'react'

const tableCode = () => {
  return (
    <div>
      <h1>this is table code </h1>

      // this is chatusers table code

      CREATE TABLE shashank_pathak.chatusers (
	id serial4 NOT NULL,
	fullname varchar(255) NOT NULL,
	email varchar(255) NOT NULL,
	username varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	profile_picture text NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT chatusers_email_key UNIQUE (email),
	CONSTRAINT chatusers_pkey PRIMARY KEY (id),
	CONSTRAINT chatusers_username_key UNIQUE (username)
);




// this is chatmessage table code 
CREATE TABLE shashank_pathak.chatmessages (
	id serial4 NOT NULL,
	sender_id int4 NOT NULL,
	receiver_id int4 NOT NULL,
	message text NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	"read" bool DEFAULT false NULL,
	CONSTRAINT chatmessages_pkey PRIMARY KEY (id)
);


-- shashank_pathak.chatmessages foreign keys

ALTER TABLE shashank_pathak.chatmessages ADD CONSTRAINT chatmessages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES shashank_pathak.chatusers(id);
ALTER TABLE shashank_pathak.chatmessages ADD CONSTRAINT chatmessages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES shashank_pathak.chatusers(id);


// this is chatgroup table code 

CREATE TABLE shashank_pathak.chatgroups (
	id serial4 NOT NULL,
	group_name varchar(255) NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT chatgroups_group_name_key UNIQUE (group_name),
	CONSTRAINT chatgroups_pkey PRIMARY KEY (id)
);


// this is group members table code 

CREATE TABLE shashank_pathak.groupmembers (
	id serial4 NOT NULL,
	group_id int4 NOT NULL,
	user_id int4 NOT NULL,
	joined_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT groupmembers_group_user_unique UNIQUE (group_id, user_id),
	CONSTRAINT groupmembers_pkey PRIMARY KEY (id)
);


-- shashank_pathak.groupmembers foreign keys

ALTER TABLE shashank_pathak.groupmembers ADD CONSTRAINT groupmembers_group_id_fkey FOREIGN KEY (group_id) REFERENCES shashank_pathak.chatgroups(id);
ALTER TABLE shashank_pathak.groupmembers ADD CONSTRAINT groupmembers_user_id_fkey FOREIGN KEY (user_id) REFERENCES shashank_pathak.chatusers(id);





// this is group messages table code 



CREATE TABLE shashank_pathak.groupmessages (
	id serial4 NOT NULL,
	group_id int4 NOT NULL,
	sender_id int4 NOT NULL,
	message text NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT groupmessages_pkey PRIMARY KEY (id)
);


-- shashank_pathak.groupmessages foreign keys

ALTER TABLE shashank_pathak.groupmessages ADD CONSTRAINT groupmessages_group_id_fkey FOREIGN KEY (group_id) REFERENCES shashank_pathak.chatgroups(id);
ALTER TABLE shashank_pathak.groupmessages ADD CONSTRAINT groupmessages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES shashank_pathak.chatusers(id);

    </div>
  )
}

export default tableCode
