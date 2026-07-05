import React from 'react'
import { useShow } from '@refinedev/core';
import { useParams } from 'react-router';
import { ShowView } from '@/components/refine-ui/views/show-view';
import { ShowViewHeader } from '@/components/refine-ui/views/show-view';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { bannerPhoto } from '@/lib/cloudinary';

function Show() {
  const navigate = useNavigate();
  const {query} = useShow({
    resource:"classes",
    id:useParams().id,
  });
  const {isLoading,isError} = query;
  const data = query.data?.data;
  if(isLoading||isError||!data){
    return (
        <ShowView className="class-view class-show">
            <ShowViewHeader resource="classes" title={data?.name}></ShowViewHeader>
            <p className="state-message">{isLoading?"Loading...":isError?"Error loading class details":!data?"No data found":""}</p>
        </ShowView>
    )
  }
  const teacher_name=data.teacher?.name??"Unknown";
  const teacher_initials=teacher_name.split(" ").map((name:string)=>name[0]).join("");
  const place_holder_url=`https://placehold.co/600x400?text=${teacher_initials}`;
  const bannerSrc = data.bannerCldPubId
    ? bannerPhoto(data.bannerCldPubId,data.name).toURL()
    : data.bannerUrl;

  return (
    <ShowView className="class-view class-show">
        <ShowViewHeader resource="classes" title={data?.name}></ShowViewHeader>
        <div className="banner">
            {bannerSrc ? (
              <img src={bannerSrc} alt={`${data.name} banner`} />
            ) : (
              <div className="placeholder" aria-hidden="true" />
            )}
        </div>
        <Card className="details-card">
            <div className="details-header">
                <div>
                    <h1>{data.name}</h1>
                    <p>{data.description}</p>
                </div>
                <div>
                    <Badge variant="default">{data.status.toUpperCase()}</Badge>
                    <Badge variant="outline">Capacity: {data.capacity} students</Badge>
                </div>
            </div>
            <div className="details-grid">
                <div className="instructor">
                    <p>Instructor</p>
                    <Avatar className="size-10">
                        <AvatarImage src={data.teacher?.image||place_holder_url} alt={data.teacher?.name}/>
                        <AvatarFallback>{teacher_initials}</AvatarFallback>
                    </Avatar>
                    <p className="text-lg font-bold text-primary">{teacher_name}</p>
                    <p>{data.teacher?.email}</p>
                </div>
                <div className="department">
                    <p>Department</p>
                    <div>
                        <Badge variant="outline">{data.department?.code}</Badge>
                        <p>{data.department?.name}</p>
                        <p>{data.department?.description}</p>
                    </div>
                </div>
                <div className="subject">
                    <p>Subject</p>
                    <div>
                        <Badge variant="outline">{data.subject?.code}</Badge>
                        <p>{data.subject?.name}</p>
                        <p>{data.subject?.description}</p>
                    </div>
                </div>
                <Separator className="col-span-full" />
                <div className="join">
                    <h2>Join the class</h2>
                        <ol>
                            <p>Enter the invite code</p>
                        </ol>
                </div>
                <Button size="lg" className="flex items-center gap-2 font-semibold" onClick={()=>navigate("/join-class")}>Join Class</Button>
            </div>
        </Card>
    </ShowView>
  )
}

export default Show