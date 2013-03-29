#!/usr/bin/python

import os
import sys
import csv
import json

# Keynotes
#KEYNOTE TITLE,ABSTRACT,SPEAKER NAME,SPEAKER TITLE,SPEAKER COMPANY,SPEAKER BIOGRAPHY

# Solution Track
# SESSION TITLE,HOUR TITLE,SESSION ABSTRACT,AUDIENCE TAKE-AWAY,SPEAKER FIRST,SPEAKER LAST,JOB TITLE,COMPANY NAME,EMAIL ADDRESS,PRESENTATION FORMAT,PHONE,STATUS,BIOGRAPHY,DATE OF SESSION,TIME OF SESSION,ROOM,TRACK,SESSION TAG,SESSION OWNER,PHOTO,CO-PRESENTER FIRST,CO-PRESENTER LAST,CO-PRESENTER JOB TITLE,CO-PRESENTER COMPANY,CO-PRESENTER BIOGRAPHY,CO-PRESENTER #2 FIRST,CO-PRESENTER #2 LAST,CO-PRESENTER #2 JOB TITLE,CO-PRESENTER #2 COMPANY,CO-PRESENTER #2 BIOGRAPHY,SESSION NOTES

# Partner
# SESSION TITLE,HOUR TITLE,SESSION ABSTRACT,AUDIENCE TAKE-AWAY,SPEAKER FIRST,SPEAKER LAST,JOB TITLE,COMPANY NAME,EMAIL ADDRESS,PRESENTATION FORMAT,PHONE,STATUS,BIOGRAPHY,DATE OF SESSION,TIME OF SESSION,ROOM,TRACK,SESSION TAG,SESSION OWNER,PHOTO,CO-PRESENTER FIRST,CO-PRESENTER LAST,CO-PRESENTER JOB TITLE,CO-PRESENTER COMPANY,CO-PRESENTER BIOGRAPHY,CO-PRESENTER #2 FIRST,CO-PRESENTER #2 LAST,CO-PRESENTER #2 JOB TITLE,CO-PRESENTER #2 COMPANY,CO-PRESENTER #2 BIOGRAPHY,SESSION NOTES

# Tech and Lightning
#SESSION TITLE,HOUR TITLE,HOUR DESCRIPTION and number,SESSION ABSTRACT,AUDIENCE TAKE-AWAY,SPEAKER FIRST,SPEAKER LAST,JOB TITLE,COMPANY NAME,EMAIL ADDRESS,PRESENTATION FORMAT,PHONE,STATUS,BIOGRAPHY,DATE OF SESSION,TIME OF SESSION,ROOM,TRACK,SESSION TAG,SESSION OWNER,PHOTO,CO-PRESENTER FIRST,CO-PRESENTER LAST,CO-PRESENTER JOB TITLE,CO-PRESENTER COMPANY,CO-PRESENTER BIOGRAPHY,CO-PRESENTER #2 FIRST,CO-PRESENTER #2 LAST,CO-PRESENTER #2 JOB TITLE,CO-PRESENTER #2 COMPANY,CO-PRESENTER #2 BIOGRAPHY,SESSION NOTES

# session
#{
#    id: 111,
#    type: session,
#    giveSurvey: false,
#    title: "The stuff",
#    plenary: true,
#    selectable: true,
#    startTime: 'ddd',
#    endTime: 'eee',
#    track: 'training',
#    location: 'Room',
#    abstact: 'Stuff',
#    speakerIds: [
#        222
#    ],
#    speakerNames: [
#        "John Smith"
#    ]
#}

# speaker
#{
#    id: 222,
#    type: 'speaker',
#    affiliation: 'Big Corp',
#    bio: 'Stuff...',
#    email: 'jsmith@corp.com',
#    name: 'John Smith',
#    title: 'Director of Foo'
#}


sessionID = 0
speakerID = 0

tracks = {
    'Partners' : 'customer',
    'Solutions Track' : 'business',
    'Tech and Lightning' : 'technical'
}

for c in ['Partners', 'Solutions Track', 'Tech and Lightning']:
    with open("MLW13_Master Session Listing - " + c + ".csv", 'rb') as csvfile:
        creader = csv.DictReader(csvfile)
        for row in creader:
            sessionID = sessionID + 1

            session = dict()
            session['type'] = 'session'
            session['track'] = tracks[c]
            session['location'] = row['ROOM']
            session['title'] = row['SESSION TITLE']
            session['abstract'] = row['SESSION ABSTRACT']
            session['giveSurvey'] = True
            session['selectable'] = True
            session['plenary'] = False
            session['featured'] = False
            session['id'] = "" + str(sessionID)
            date = row['DATE OF SESSION']
            time = row['TIME OF SESSION']
            if date and time:
                day = '10'
                hour = '01'
                minute = '00'
                session['startTime'] = '2013-04-' + day + 'T' + hour + ":" + minute + ':00'
                session['endTime'] = '2013-04-' + day + 'T' + hour + ":" + minute + ':00'
            else:
                print "Skipping"
                continue

            session['speakerNames'] = [ row['SPEAKER FIRST'] + ' ' + row['SPEAKER LAST'] ]

            speakerID = speakerID + 1
            speaker_file = open('speakers/' + str(speakerID) + ".json" , 'w')

            speaker = dict()
            speaker['type'] = 'speaker'
            speaker['name'] = row['SPEAKER FIRST'] + ' ' + row['SPEAKER LAST']
            speaker['affiliation'] = row['COMPANY NAME']
            speaker['bio'] = row['BIOGRAPHY']
            speaker['email'] = row['EMAIL ADDRESS']
            speaker['position'] = row['JOB TITLE']
            speaker['id'] = "" + str(speakerID)
            speaker_file.write(json.dumps(speaker))

            session['speakerIds'] = [ "" + str(speakerID) ]

            if row['CO-PRESENTER FIRST'] :
                speakerID = speakerID + 1
                speaker_file = open('speakers/' + str(speakerID) + ".json" , 'w')
                speaker = dict()
                speaker['type'] = 'speaker'
                speaker['name'] = row['CO-PRESENTER FIRST'] + ' ' + row['CO-PRESENTER LAST']
                speaker['affiliation'] = row['CO-PRESENTER COMPANY']
                speaker['bio'] = row['CO-PRESENTER BIOGRAPHY']
                speaker['email'] = ''
                speaker['position'] = row['CO-PRESENTER JOB TITLE']
                speaker['id'] = "" + str(speakerID)
                speaker_file.write(json.dumps(speaker))
                session['speakerNames'].append(row['CO-PRESENTER FIRST'] + ' ' + row['CO-PRESENTER LAST'])
                session['speakerIds'].append("" + str(speakerID))

            if row['CO-PRESENTER #2 FIRST'] :
                speakerID = speakerID + 1
                speaker_file = open('speakers/' + str(speakerID) + ".json" , 'w')
                speaker = dict()
                speaker['type'] = 'speaker'
                speaker['name'] = row['CO-PRESENTER #2 FIRST'] + ' ' + row['CO-PRESENTER #2 LAST']
                speaker['affiliation'] = row['CO-PRESENTER #2 COMPANY']
                speaker['bio'] = row['CO-PRESENTER #2 BIOGRAPHY']
                speaker['email'] = ''
                speaker['position'] = row['CO-PRESENTER #2 JOB TITLE']
                speaker['id'] = "" + str(speakerID)
                speaker_file.write(json.dumps(speaker))
                session['speakerNames'].append(row['CO-PRESENTER #2 FIRST'] + ' ' + row['CO-PRESENTER #2 LAST'])
                session['speakerIds'].append(speakerID)

            session_file = open('sessions/' + str(sessionID) + ".json" , 'w')
            session_file.write(json.dumps(session))

