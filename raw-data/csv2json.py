#!/usr/bin/python

import os
import sys
import csv
import json
import time
import datetime
from datetime import timedelta

# Keynotes
#SESSION TITLE,ABSTRACT,SPEAKER NAME,SPEAKER TITLE,SPEAKER COMPANY,SPEAKER BIOGRAPHY

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
    'Tech and Lightning' : 'technical',
    'Keynote' : 'keynote'
}

speakers = dict()

for c in ['Partners', 'Solutions Track', 'Tech and Lightning', 'Keynote']:
    with open("MLW13_Master Session Listing - " + c + ".csv", 'rb') as csvfile:
        creader = csv.DictReader(csvfile)
        for row in creader:
            name = row['SPEAKER FIRST'].strip() + ' ' + row['SPEAKER LAST'].strip()
            if (not(name in speakers)) :
                speakerID = speakerID + 1
                speaker_file = open('speakers/' + str(speakerID) + ".json" , 'w')
                speaker = dict()
                speaker['type'] = 'speaker'
                speaker['name'] = name
                speaker['affiliation'] = row['COMPANY NAME']
                speaker['bio'] = row['BIOGRAPHY']
                speaker['email'] = row['EMAIL ADDRESS']
                speaker['position'] = row['JOB TITLE']
                speaker['id'] = "" + str(speakerID)
                speaker_file.write(json.dumps(speaker, sort_keys=True,
                  indent=4, separators=(',', ': ')))
                speakers[name] = speaker

            if row['CO-PRESENTER FIRST'] :
                name = row['CO-PRESENTER FIRST'].strip() + ' ' + row['CO-PRESENTER LAST'].strip()
                if (not(name in speakers)) :
                    speakerID = speakerID + 1
                    speaker_file = open('speakers/' + str(speakerID) + ".json" , 'w')
                    speaker = dict()
                    speaker['type'] = 'speaker'
                    speaker['name'] = name
                    speaker['affiliation'] = row['CO-PRESENTER COMPANY']
                    speaker['bio'] = row['CO-PRESENTER BIOGRAPHY']
                    speaker['email'] = ''  #TODO
                    speaker['position'] = row['CO-PRESENTER JOB TITLE']
                    speaker['id'] = "" + str(speakerID)
                    speaker_file.write(json.dumps(speaker, sort_keys=True,
                        indent=4, separators=(',', ': ')))
                    speakers[name] = speaker

            if row['CO-PRESENTER #2 FIRST'] :
                name = row['CO-PRESENTER #2 FIRST'].strip() + ' ' + row['CO-PRESENTER #2 LAST'].strip()
                if (not(name in speakers)) :
                    speakerID = speakerID + 1
                    speaker_file = open('speakers/' + str(speakerID) + ".json" , 'w')
                    speaker = dict()
                    speaker['type'] = 'speaker'
                    speaker['name'] = name
                    speaker['affiliation'] = row['CO-PRESENTER #2 COMPANY']
                    speaker['bio'] = row['CO-PRESENTER #2 BIOGRAPHY']
                    speaker['email'] = ''  #TODO
                    speaker['position'] = row['CO-PRESENTER #2 JOB TITLE']
                    speaker['id'] = "" + str(speakerID)
                    speaker_file.write(json.dumps(speaker, sort_keys=True,
                        indent=4, separators=(',', ': ')))
                    speakers[name] = speaker

for c in ['Partners', 'Solutions Track', 'Tech and Lightning', 'Keynote']:
    with open("MLW13_Master Session Listing - " + c + ".csv", 'rb') as csvfile:
        creader = csv.DictReader(csvfile)
        for row in creader:
            sessionID = sessionID + 1

            #if (row['HOUR TITLE'] or (c == 'Tech and Lightning' and row['HOUR DESCRIPTION and number'])):
                #print "Skipping " + row["HOUR TITLE"] + " " + row['HOUR DESCRIPTION and number'] + " (" + row["SESSION TITLE"] + ")"
                #continue

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
            s_time = row['TIME OF SESSION']
            if date and s_time:
                if '-' in date:
                    day = int(date.split('-')[1])
                else:
                    day = int(date.split()[1])
                t = s_time.split(':')
                hour = int(t[0])
                goo = t[1].split()
                minute = int(goo[0])
                ampm = goo[1]
                if (ampm == 'PM'): 
                    hour += 12

                start = datetime.datetime(year=2013, month=04, day=day, hour=hour, minute=minute)
                end = start + timedelta(minutes=50)

                start_str = start.strftime("%Y-%m-%dT%H:%M:%S")
                end_str = end.strftime("%Y-%m-%dT%H:%M:%S")

                
                session['startTime'] = start_str
                session['endTime'] = end_str
            else:
                print "Skipping " + session['title']
                continue

            name = row['SPEAKER FIRST'].strip() + ' ' + row['SPEAKER LAST'].strip() 
            coname = row['CO-PRESENTER FIRST'].strip() + ' ' + row['CO-PRESENTER LAST'].strip()
            coname2 = row['CO-PRESENTER #2 FIRST'].strip() + ' ' + row['CO-PRESENTER #2 LAST'].strip()

            speakerID = speakers[name]['id']
            session['speakerNames'] = [ name ]
            session['speakerIds'] = [ "" + str(speakerID) ]

            if row['CO-PRESENTER FIRST'] and (coname != name) :
                name = coname
                session['speakerNames'].append(name)
                speakerID = speakers[name]['id']
                session['speakerIds'].append("" + str(speakerID))

            if row['CO-PRESENTER #2 FIRST'] and (coname2 != name) :
                name = coname2
                session['speakerNames'].append(name)
                speakerID = speakers[name]['id']
                session['speakerIds'].append("" + str(speakerID))

            session_file = open('sessions/' + str(sessionID) + ".json" , 'w')
            session_file.write(json.dumps(session, sort_keys=True,
                  indent=4, separators=(',', ': ')))

