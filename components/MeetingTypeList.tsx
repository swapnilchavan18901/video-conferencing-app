/* eslint-disable camelcase */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';
import { Input } from './ui/input';
import HomeCard from './HomeCard';
import { Toaster } from "@/components/ui/toaster";
import DatePicker  from "react-datepicker";
import MeetingModal from './MeetingModal';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';

const MeetingTypeList = () => {
    const [MeetingState ,setMeetingState]=useState<'isScheduleMeeting'|'isJoiningMeeting'|'isInstantMeeting'|undefined>();
    const router = useRouter();
    const {user}=useUser();
    const { toast } = useToast();
    const client=useStreamVideoClient();
    const [values,setValues]=useState({
      dateTime: new Date(),
      description:'',
      link:''
    });
    const [CallDetails, setCallDetails] = useState<Call>();
    const createMeeting=async()=>{
      if(!client ||!user)return ;
      
      try{
        if(!values.dateTime){
          toast({title:"Please select a date and time"})
          return;
        }
        const id=crypto.randomUUID();
        const call =client.call('default',id);
        if(!call) throw new Error('Fail to create Meeting');
        const startAt=values.dateTime.toISOString()||new Date(Date.now()).toISOString();
        const description=values.description||'Instantmeeting';
        await call.getOrCreate({data:{
          starts_at:startAt,
          custom:{
            description:description
          }
        }})
        setCallDetails(call);
        if(!values.description){
          router.push(`/meeting/${call.id}`)
        }
        toast({title:"Meeting Created"})

      }
      catch(e){
        console.log(e)
        toast({title:"Failed to create the meeting"})
      }

    }
    const meetingLink=`${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${CallDetails?.id}`
    
  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard
        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        handleClick={() => setMeetingState('isInstantMeeting')}
      />
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="via invitation link"
        className="bg-blue-1"
        handleClick={() => setMeetingState('isJoiningMeeting')}
      />
      <HomeCard
        img="/icons/schedule.svg"
        title="Schedule Meeting"
        description="Plan your meeting"
        className="bg-purple-1"
        handleClick={() => setMeetingState('isScheduleMeeting')}
      />
      <HomeCard
        img="/icons/recordings.svg"
        title="View Recordings"
        description="Meeting Recordings"
        className="bg-yellow-1"
        handleClick={() => router.push('/recordings')}
      />
      {!CallDetails?(
        <MeetingModal
        isOpen={MeetingState==='isScheduleMeeting'}
        onClose={()=>{setMeetingState(undefined)}}
        title="Create Meeting"
       
        handleClick={createMeeting}
        >
          <div className="flex flex-col gap-2.5">
              <label className="text-base text-normal leading-[22px] text-sky-2">
                Add a description
              </label>
              <Textarea className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0" onChange={(e)=>{
                setValues({...values,description:e.target.value})
              }}/>
          </div>
          <div className="flex flex-col gap-2.5">

          <label className="text-base text-normal leading-[22px] text-sky-2">
             Select Date and Time
          </label>
             <DatePicker  selected={values.dateTime} onChange={(date)=>setValues(
              {...values,dateTime:date!})}
              showTimeSelect 
             TimeFormat="HH:MM"
             timeInterval={15}
             timeCaption="time"
             dateFormat="MMMM d, yyyy h:mm aa"
             className="w-full focus:outline-none rounded bg-dark-3 p-2"
             />
              </div>
        </MeetingModal>
          ):(
        <MeetingModal
        isOpen={MeetingState==='isScheduleMeeting'}
        onClose={()=>{setMeetingState(undefined)}}
        title="Meeting Created"
        buttonText="Copy Meeting Link"
        className="text-center"  
        handleClick={()=>{
          navigator.clipboard.writeText(meetingLink)
          toast({title:"Link Copied"})
        }}
        image="/icons/checked.svg"
        buttonIcon="/icons/copy.svg"

        />

      )}  
      <MeetingModal

        isOpen={MeetingState==='isInstantMeeting'}
        onClose={()=>{setMeetingState(undefined)}}
        title="Start an Instant Meeting"
        className="text-center"  
        handleClick={createMeeting}
        buttonText="Start Meeting"
      />
<Toaster/>
    </section>
  );
};

export default MeetingTypeList;