import Image from 'next/image';
import dynamic from 'next/dynamic';
import '@/app/ui/global.css';
import ScoreDisplay from '../ui/components/ScoreDisplay';
import React, {FC} from 'react';

const WebcamComponent = dynamic(() => import('../ui/components/webcam'), {
    ssr: false
  });

interface Props {
    // any props that come into the component
    name: String
}

const ConstructionItemComponent = dynamic(() => import('../ui/components/item'), {
  ssr: false
});

const CheckComponent = dynamic(() => import('../ui/components/check'), {
  ssr: false
});

export default function Page() {
    return (
      <main>
        <div className="relative w-full h-screen flex justify-center">
          <div className="absolute z-2 left-10 mt-10">
                <Image src="/construction.png"
                  width={200}
                  height={100}
                  className="hidden md:block"
                  alt="Screenshots of the dashboard project showing desktop version"
                />
          </div>
          <div className="absolute z-2 left-10 text-instruction">
                <p>조립 라인에서 사용해야하는 장비를 착용해주세요</p>
          </div>
          <div className="absolute z-2 right-10 text-score">
            <ScoreDisplay />
          </div>
          <div className="absolute z-2 right-10 text-item-list"> 
            <p>착용한 장비 목록</p>
            <ConstructionItemComponent name={"안전모"} />
            <CheckComponent />
            <br />
            <ConstructionItemComponent name={"조끼"} />
            <CheckComponent />
            <br />
            <ConstructionItemComponent name={"장갑"} />
            <CheckComponent />
            <br />
            <ConstructionItemComponent name={"고글"} />
            <CheckComponent />
            <br />
            <ConstructionItemComponent name={"마스크"} />
            <CheckComponent />
            <br />
          </div>
          <br></br>
          <div className="absolute z-2" style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap'}}>
          <div className="absolute z-2 right-4">
          </div>
          </div>
        </div>
      </main>
    );
  }