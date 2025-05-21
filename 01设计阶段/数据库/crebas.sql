/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     2025/5/21 18:12:44                           */
/*==============================================================*/


drop table if exists Account;

drop table if exists Answer;

drop table if exists Asset;

drop table if exists Category;

drop table if exists Chapter;

drop table if exists Chat;

drop table if exists Choice;

drop table if exists City;

drop table if exists Classification;

drop table if exists Common;

drop table if exists Course;

drop table if exists Discussion;

drop table if exists Grade;

drop table if exists Homework;

drop table if exists Info;

drop table if exists Live;

drop table if exists Major;

drop table if exists Member;

drop table if exists Notification;

drop table if exists Participant;

drop table if exists Payment;

drop table if exists Playback;

drop table if exists Position;

drop table if exists Province;

drop table if exists Question;

drop table if exists Quiz;

drop table if exists Record;

drop table if exists Review;

drop table if exists School;

drop table if exists Squad;

drop table if exists Status;

drop table if exists Submission;

drop table if exists Subscribe;

drop table if exists Visit;

/*==============================================================*/
/* Table: Account                                               */
/*==============================================================*/
create table Account
(
   Account_Id           int not null,
   Account_Name         varchar(30) not null,
   Phone                varchar(20) not null,
   Email                varchar(100) not null,
   Password_Hash        varchar(60) not null,
   Main_Login_Method    varchar(10) not null,
   Registration_Time    datetime not null,
   Cancel               bool not null,
   primary key (Account_Id)
);

/*==============================================================*/
/* Table: Answer                                                */
/*==============================================================*/
create table Answer
(
   Account_Id           int not null,
   Question_Id          int not null,
   Selected_Option_Id   int not null,
   Answer_Text          varchar(255) not null,
   Answer_Image_Url     varchar(255) not null,
   Correct              bool not null,
   Answer_Grade         int not null,
   primary key (Account_Id, Question_Id)
);

/*==============================================================*/
/* Table: Asset                                                 */
/*==============================================================*/
create table Asset
(
   Asset_Id             int not null,
   Chapter_Id           int not null,
   Asset_Name           varchar(30) not null,
   Asset_Type           varchar(30) not null,
   Asset_Size           bigint not null,
   Asset_Url            varchar(255) not null,
   Asset_Time           datetime not null,
   Asset_Permission     varchar(30) not null,
   Download_Count       int not null,
   primary key (Asset_Id)
);

/*==============================================================*/
/* Table: Category                                              */
/*==============================================================*/
create table Category
(
   Category_Id          int not null,
   Category_Info        varchar(30) not null,
   primary key (Category_Id)
);

/*==============================================================*/
/* Table: Chapter                                               */
/*==============================================================*/
create table Chapter
(
   Chapter_Id           int not null,
   Course_Id            int not null,
   Chapter_Title        varchar(30) not null,
   Chapter_Order        int not null,
   Cha_Chapter_Id       int,
   primary key (Chapter_Id)
);

/*==============================================================*/
/* Table: Chat                                                  */
/*==============================================================*/
create table Chat
(
   Account_Id           int not null,
   Live_Id              int not null,
   Chat_Content         varchar(255) not null,
   Sent_Time            datetime not null,
   primary key (Account_Id, Live_Id)
);

/*==============================================================*/
/* Table: Choice                                                */
/*==============================================================*/
create table Choice
(
   Choice_Id            int not null,
   Question_Id          int not null,
   Choice_Text          varchar(255) not null,
   Proper               bool not null,
   primary key (Choice_Id)
);

/*==============================================================*/
/* Table: City                                                  */
/*==============================================================*/
create table City
(
   City_Id              int not null,
   Province_Id          int not null,
   City_Name            varchar(30) not null,
   primary key (City_Id)
);

/*==============================================================*/
/* Table: Classification                                        */
/*==============================================================*/
create table Classification
(
   Course_Id            int not null,
   Category_Id          int not null,
   primary key (Course_Id, Category_Id)
);

/*==============================================================*/
/* Table: Common                                                */
/*==============================================================*/
create table Common
(
   Common_Id            int not null,
   Squad_Id             int not null,
   Account_Id           int not null,
   Common_Name          varchar(30) not null,
   Common_Type          varchar(30) not null,
   Common_Size          bigint not null,
   Common_Url           varchar(255) not null,
   Common_Time          datetime not null,
   Common_Permission    varchar(30) not null,
   primary key (Common_Id)
);

/*==============================================================*/
/* Table: Course                                                */
/*==============================================================*/
create table Course
(
   Course_Id            int not null,
   Account_Id           int not null,
   Course_Type          varchar(30) not null,
   Course_Name          varchar(30) not null,
   Course_Brief         varchar(255) not null,
   Cover_Image_Url      varchar(255) not null,
   Teaching_Objectives  varchar(255) not null,
   Cost                 int not null,
   Course_Time          datetime not null,
   Teaching_Start_Time  datetime not null,
   Teaching_End_Time    datetime not null,
   primary key (Course_Id)
);

/*==============================================================*/
/* Table: Discussion                                            */
/*==============================================================*/
create table Discussion
(
   Discussion_Id        int not null,
   Account_Id           int not null,
   Course_Id            int not null,
   Discussion_Content   varchar(255) not null,
   Dis_Discussion_Id    int,
   primary key (Discussion_Id)
);

/*==============================================================*/
/* Table: Grade                                                 */
/*==============================================================*/
create table Grade
(
   Account_Id           int not null,
   Quiz_Id              int not null,
   Score                int not null,
   primary key (Account_Id, Quiz_Id)
);

/*==============================================================*/
/* Table: Homework                                              */
/*==============================================================*/
create table Homework
(
   Homework_Id          int not null,
   Chapter_Id           int not null,
   Homework_Name        varchar(30) not null,
   Requirement          varchar(255) not null,
   Deadline             datetime not null,
   Homeword_Time        datetime not null,
   primary key (Homework_Id)
);

/*==============================================================*/
/* Table: Info                                                  */
/*==============================================================*/
create table Info
(
   Position_Id          int not null,
   Account_Id           int not null,
   City_Id              int not null,
   Major_Id             int not null,
   School_Id            int not null,
   Gender               bool not null,
   Date_Of_Birth        date not null,
   Personal_Profile     varchar(255) not null,
   primary key (Position_Id, Account_Id)
);

/*==============================================================*/
/* Table: Live                                                  */
/*==============================================================*/
create table Live
(
   Live_Id              int not null,
   Course_Id            int not null,
   Live_Title           varchar(30) not null,
   Live_Description     varchar(255) not null,
   Live_Start_Time      datetime not null,
   Live_End_Time        datetime not null,
   Live_Status          varchar(30) not null,
   Live_Url             varchar(255) not null,
   Live_Create_Time     datetime not null,
   Live_Update_Time     datetime not null,
   Recording            bool not null,
   primary key (Live_Id)
);

/*==============================================================*/
/* Table: Major                                                 */
/*==============================================================*/
create table Major
(
   Major_Id             int not null,
   Major_Name           varchar(30) not null,
   primary key (Major_Id)
);

/*==============================================================*/
/* Table: Member                                                */
/*==============================================================*/
create table Member
(
   Account_Id           int not null,
   Squad_Id             int not null,
   Leader               bool not null,
   primary key (Account_Id, Squad_Id)
);

/*==============================================================*/
/* Table: Notification                                          */
/*==============================================================*/
create table Notification
(
   Notification_Id      int not null,
   Course_Id            int not null,
   Content              varchar(255) not null,
   Notification_Type    varchar(30) not null,
   Notification_Time    datetime not null,
   primary key (Notification_Id)
);

/*==============================================================*/
/* Table: Participant                                           */
/*==============================================================*/
create table Participant
(
   Account_Id           int not null,
   Live_Id              int not null,
   Join_Time            datetime not null,
   Leave_Time           datetime not null,
   Duration             int not null,
   primary key (Account_Id, Live_Id)
);

/*==============================================================*/
/* Table: Payment                                               */
/*==============================================================*/
create table Payment
(
   Account_Id           int not null,
   Course_Id            int not null,
   Payment_Id           int not null,
   Payment_Time         datetime not null,
   primary key (Payment_Id)
);

/*==============================================================*/
/* Table: Playback                                              */
/*==============================================================*/
create table Playback
(
   Account_Id           int not null,
   Record_Id            int not null,
   Finish               bool not null,
   primary key (Account_Id, Record_Id)
);

/*==============================================================*/
/* Table: Position                                              */
/*==============================================================*/
create table Position
(
   Position_Id          int not null,
   Position_Name        varchar(20) not null,
   primary key (Position_Id)
);

/*==============================================================*/
/* Table: Province                                              */
/*==============================================================*/
create table Province
(
   Province_Id          int not null,
   Province_Name        varchar(30) not null,
   primary key (Province_Id)
);

/*==============================================================*/
/* Table: Question                                              */
/*==============================================================*/
create table Question
(
   Question_Id          int not null,
   Quiz_Id              int,
   Question_Text        varchar(255) not null,
   Question_Image_Url   varchar(255) not null,
   Question_Type        varchar(30) not null,
   Reference_Answer     varchar(255) not null,
   Reference_Answer_Image_Url varchar(255) not null,
   Question_Order       int not null,
   Question_Grade       int not null,
   primary key (Question_Id)
);

/*==============================================================*/
/* Table: Quiz                                                  */
/*==============================================================*/
create table Quiz
(
   Quiz_Id              int not null,
   Course_Id            int not null,
   Quiz_Name            varchar(30) not null,
   Quiz_Detail          varchar(255) not null,
   Quiz_Start_Time      datetime not null,
   Quiz_End_TIme        datetime not null,
   Total_Score          int not null,
   Passing_Score        int not null,
   Quiz_Time            datetime not null,
   primary key (Quiz_Id)
);

/*==============================================================*/
/* Table: Record                                                */
/*==============================================================*/
create table Record
(
   Record_Id            int not null,
   Live_Id              int not null,
   Record_Url           varchar(255) not null,
   primary key (Record_Id)
);

/*==============================================================*/
/* Table: Review                                                */
/*==============================================================*/
create table Review
(
   Course_Id            int not null,
   Account_Id           int not null,
   Reviewt_Content      varchar(255) not null,
   Review_Time          datetime not null,
   Star_Rating          int not null,
   Approve              bool not null,
   primary key (Course_Id, Account_Id)
);

/*==============================================================*/
/* Table: School                                                */
/*==============================================================*/
create table School
(
   School_Id            int not null,
   School_Name          varchar(30) not null,
   School_Type          varchar(30) not null,
   primary key (School_Id)
);

/*==============================================================*/
/* Table: Squad                                                 */
/*==============================================================*/
create table Squad
(
   Squad_Id             int not null,
   Course_Id            int not null,
   Squad_Name           varchar(30) not null,
   Squad_Time           datetime not null,
   primary key (Squad_Id)
);

/*==============================================================*/
/* Table: Status                                                */
/*==============================================================*/
create table Status
(
   Account_Id           int not null,
   Notification_Id      int not null,
   Read_Status          bool not null,
   primary key (Account_Id, Notification_Id)
);

/*==============================================================*/
/* Table: Submission                                            */
/*==============================================================*/
create table Submission
(
   Account_Id           int not null,
   Homework_Id          int not null,
   Submission_Name      varchar(30) not null,
   Submission_Type      varchar(30) not null,
   Submission_Size      bigint not null,
   Submission_Url       varchar(255) not null,
   Submission_Time      datetime not null,
   Submission_Score     int not null,
   Feedback             varchar(255) not null,
   primary key (Account_Id, Homework_Id)
);

/*==============================================================*/
/* Table: Subscribe                                             */
/*==============================================================*/
create table Subscribe
(
   Account_Id           int not null,
   Course_Id            int not null,
   Status               varchar(30) not null,
   primary key (Account_Id, Course_Id)
);

/*==============================================================*/
/* Table: Visit                                                 */
/*==============================================================*/
create table Visit
(
   Account_Id           int not null,
   Asset_Id             int not null,
   Visited              bool not null,
   primary key (Account_Id, Asset_Id)
);

alter table Answer add constraint FK_Relationship_34 foreign key (Question_Id)
      references Question (Question_Id) on delete restrict on update restrict;

alter table Answer add constraint FK_Relationship_35 foreign key (Account_Id)
      references Account (Account_Id) on delete restrict on update restrict;

alter table Asset add constraint FK_Relationship_15 foreign key (Chapter_Id)
      references Chapter (Chapter_Id) on delete restrict on update restrict;

alter table Chapter add constraint FK_Relationship_11 foreign key (Course_Id)
      references Course (Course_Id) on delete restrict on update restrict;

alter table Chapter add constraint FK_Relationship_14 foreign key (Cha_Chapter_Id)
      references Chapter (Chapter_Id) on delete restrict on update restrict;

alter table Chat add constraint FK_Relationship_42 foreign key (Live_Id)
      references Live (Live_Id) on delete restrict on update restrict;

alter table Chat add constraint FK_Relationship_43 foreign key (Account_Id)
      references Account (Account_Id) on delete restrict on update restrict;

alter table Choice add constraint FK_Relationship_32 foreign key (Question_Id)
      references Question (Question_Id) on delete restrict on update restrict;

alter table City add constraint FK_Relationship_45 foreign key (Province_Id)
      references Province (Province_Id) on delete restrict on update restrict;

alter table Classification add constraint FK_Relationship_6 foreign key (Category_Id)
      references Category (Category_Id) on delete restrict on update restrict;

alter table Classification add constraint FK_Relationship_7 foreign key (Course_Id)
      references Course (Course_Id) on delete restrict on update restrict;

alter table Common add constraint FK_Relationship_18 foreign key (Squad_Id)
      references Squad (Squad_Id) on delete restrict on update restrict;

alter table Common add constraint FK_Relationship_27 foreign key (Account_Id)
      references Account (Account_Id) on delete restrict on update restrict;

alter table Course add constraint FK_Relationship_4 foreign key (Account_Id)
      references Account (Account_Id) on delete restrict on update restrict;

alter table Discussion add constraint FK_Relationship_10 foreign key (Account_Id)
      references Account (Account_Id) on delete restrict on update restrict;

alter table Discussion add constraint FK_Relationship_8 foreign key (Dis_Discussion_Id)
      references Discussion (Discussion_Id) on delete restrict on update restrict;

alter table Discussion add constraint FK_Relationship_9 foreign key (Course_Id)
      references Course (Course_Id) on delete restrict on update restrict;

alter table Grade add constraint FK_Relationship_36 foreign key (Quiz_Id)
      references Quiz (Quiz_Id) on delete restrict on update restrict;

alter table Grade add constraint FK_Relationship_37 foreign key (Account_Id)
      references Account (Account_Id) on delete restrict on update restrict;

alter table Homework add constraint FK_Relationship_16 foreign key (Chapter_Id)
      references Chapter (Chapter_Id) on delete restrict on update restrict;

alter table Info add constraint FK_Relationship_2 foreign key (Account_Id)
      references Account (Account_Id) on delete restrict on update restrict;

alter table Info add constraint FK_Relationship_3 foreign key (Position_Id)
      references Position (Position_Id) on delete restrict on update restrict;

alter table Info add constraint FK_Relationship_48 foreign key (City_Id)
      references City (City_Id) on delete restrict on update restrict;

alter table Info add constraint FK_Relationship_49 foreign key (Major_Id)
      references Major (Major_Id) on delete restrict on update restrict;

alter table Info add constraint FK_Relationship_50 foreign key (School_Id)
      references School (School_Id) on delete restrict on update restrict;

alter table Live add constraint FK_Relationship_39 foreign key (Course_Id)
      references Course (Course_Id) on delete restrict on update restrict;

alter table Member add constraint FK_Relationship_28 foreign key (Squad_Id)
      references Squad (Squad_Id) on delete restrict on update restrict;

alter table Member add constraint FK_Relationship_29 foreign key (Account_Id)
      references Account (Account_Id) on delete restrict on update restrict;

alter table Notification add constraint FK_Relationship_51 foreign key (Course_Id)
      references Course (Course_Id) on delete restrict on update restrict;

alter table Participant add constraint FK_Relationship_40 foreign key (Live_Id)
      references Live (Live_Id) on delete restrict on update restrict;

alter table Participant add constraint FK_Relationship_41 foreign key (Account_Id)
      references Account (Account_Id) on delete restrict on update restrict;

alter table Payment add constraint FK_Relationship_19 foreign key (Account_Id, Course_Id)
      references Subscribe (Account_Id, Course_Id) on delete restrict on update restrict;

alter table Playback add constraint FK_Relationship_46 foreign key (Record_Id)
      references Record (Record_Id) on delete restrict on update restrict;

alter table Playback add constraint FK_Relationship_47 foreign key (Account_Id)
      references Account (Account_Id) on delete restrict on update restrict;

alter table Question add constraint FK_Relationship_31 foreign key (Quiz_Id)
      references Quiz (Quiz_Id) on delete restrict on update restrict;

alter table Quiz add constraint FK_Relationship_30 foreign key (Course_Id)
      references Course (Course_Id) on delete restrict on update restrict;

alter table Record add constraint FK_Relationship_44 foreign key (Live_Id)
      references Live (Live_Id) on delete restrict on update restrict;

alter table Review add constraint FK_Relationship_12 foreign key (Account_Id)
      references Account (Account_Id) on delete restrict on update restrict;

alter table Review add constraint FK_Relationship_13 foreign key (Course_Id)
      references Course (Course_Id) on delete restrict on update restrict;

alter table Squad add constraint FK_Relationship_17 foreign key (Course_Id)
      references Course (Course_Id) on delete restrict on update restrict;

alter table Status add constraint FK_Relationship_53 foreign key (Notification_Id)
      references Notification (Notification_Id) on delete restrict on update restrict;

alter table Status add constraint FK_Relationship_54 foreign key (Account_Id)
      references Account (Account_Id) on delete restrict on update restrict;

alter table Submission add constraint FK_Relationship_23 foreign key (Homework_Id)
      references Homework (Homework_Id) on delete restrict on update restrict;

alter table Submission add constraint FK_Relationship_24 foreign key (Account_Id)
      references Account (Account_Id) on delete restrict on update restrict;

alter table Subscribe add constraint FK_Relationship_20 foreign key (Course_Id)
      references Course (Course_Id) on delete restrict on update restrict;

alter table Subscribe add constraint FK_Relationship_21 foreign key (Account_Id)
      references Account (Account_Id) on delete restrict on update restrict;

alter table Visit add constraint FK_Relationship_25 foreign key (Asset_Id)
      references Asset (Asset_Id) on delete restrict on update restrict;

alter table Visit add constraint FK_Relationship_26 foreign key (Account_Id)
      references Account (Account_Id) on delete restrict on update restrict;

