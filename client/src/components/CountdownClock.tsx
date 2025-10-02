import { useEffect, useState } from "react";

const CountdownClock = ({
  timeoutThresholdDate,
}: {
  timeoutThresholdDate: Date;
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    setInterval(() => {
      const now = new Date();
      const timeDiff = timeoutThresholdDate.getTime() - now.getTime();
      setTimeRemaining(Math.floor(timeDiff / 1000));
    }, 1000);
  }, [timeoutThresholdDate]);

  return (
    <div>
      <p>
        {timeRemaining > 0
          ? `${timeRemaining} seconds remaining`
          : "Time's up!"}
      </p>
    </div>
  );
};

export default CountdownClock;
