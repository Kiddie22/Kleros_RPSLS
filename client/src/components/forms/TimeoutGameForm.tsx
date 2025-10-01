import { useWeb3 } from "@/contexts/Web3Context";
import { useRpsContractFactory } from "@/hooks/useRpsContractFactory";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TimeoutGameForm = ({ contractAddress }: { contractAddress: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const [hasPlayer1TimedOut, setHasPlayer1TimedOut] = useState<boolean>(false);
  const [hasPlayer2TimedOut, setHasPlayer2TimedOut] = useState<boolean>(false);

  const { provider, signer } = useWeb3();
  const { abi } = useRpsContractFactory(signer);

  const formSchema = z.object({
    contractAddress: z
      .string()
      .refine((value) => ethers.utils.isAddress(value), {
        message: "Invalid contract address",
      }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractAddress: contractAddress,
    },
  });

  useEffect(() => {
    const fetchContractInfo = async () => {
      try {
        const contract = new ethers.Contract(contractAddress, abi, provider!);

        // Fetch required contract info
        const [TIMEOUT_SECONDS, lastActionTimestamp, c2, stake] =
          await Promise.all([
            contract.TIMEOUT(),
            contract.lastAction(),
            contract.c2(),
            contract.stake(),
          ]);

        // convert BigNumber to number and create date
        const timeout_seconds = TIMEOUT_SECONDS.toNumber();
        const lastActionDate = new Date(lastActionTimestamp.toNumber() * 1000);

        if (stake.isZero()) {
          setError("This game has already been solved.");
          setIsLoading(false);
          return;
        }

        // check if game has timed out
        if (lastActionDate.getTime() + timeout_seconds * 1000 > Date.now()) {
          setError("Game has not timed out yet.");
          return;
        } else {
          // check who caused the timeout
          console.log(c2);

          // if c2 is not 0, that means player 2 has moved
          // therefore the timeout was caused by player 1 not solving
          // if c2 is 0, that means play 2 has not moved and caused the timeout
          if (c2 === 0) {
            // timeout was caused by player 2 not moving
            setHasPlayer2TimedOut(true);
          } else {
            // timeout was caused by player 1 not solving
            setHasPlayer1TimedOut(true);
          }
        }
      } catch (error) {
        console.log(error);
        setError("This does not seem to be a valid RPS contract address.");
      }
    };

    if (contractAddress && ethers.utils.isAddress(contractAddress)) {
      fetchContractInfo();
    }
  }, [contractAddress]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setError("");

      const contract = new ethers.Contract(
        values.contractAddress,
        abi,
        signer!
      );

      // If player 1 timed out, player 2 can now retrieve the stake
      if (hasPlayer1TimedOut) {
        // Ensure the caller is player 2
        const j2 = await contract.j2();
        if (j2.toLowerCase() !== (await signer!.getAddress()).toLowerCase()) {
          setError(
            "Only player 2 can timeout the game. Please switch to the correct wallet."
          );
          setIsLoading(false);
          return;
        }
        console.log("Timing out player 1...");
        const tx = await contract.j1Timeout();
        const receipt = await tx.wait();
        console.log("Player 1 timed out successfully");
        console.log(receipt);
      }

      // If player 2 timed out, player 1 can now retrieve the stake
      else if (hasPlayer2TimedOut) {
        // Ensure the caller is player 1
        const j1 = await contract.j1();
        if (j1.toLowerCase() !== (await signer!.getAddress()).toLowerCase()) {
          setError(
            "Only player 1 can timeout the game. Please switch to the correct wallet."
          );
          setIsLoading(false);
          return;
        }
        console.log("Timing out player 2...");
        const tx = await contract.j2Timeout();
        const receipt = await tx.wait();
        console.log("Player 2 timed out successfully");
        console.log(receipt);
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div>
        <p>Game timed out successfully</p>
      </div>
    );
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="contractAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0x..."
                    {...field}
                    value={contractAddress}
                    disabled={true}
                  />
                </FormControl>
                <FormDescription>
                  This is the address of the contract you are timing out.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading || error !== ""}>
            {isLoading ? "Timing out..." : "Timeout game"}
          </Button>
          <p
            data-slot="form-message"
            className={cn("text-destructive text-sm")}
          >
            {error}
          </p>
        </form>
      </Form>

      {hasPlayer1TimedOut && (
        <>
          <p>Player 1 has timed out. Player 2 can retrieve the entire stake.</p>
        </>
      )}
      {hasPlayer2TimedOut && (
        <>
          <p>
            Player 2 did not join the game in time. Player 1 can retrieve the
            stake.
          </p>
        </>
      )}
    </div>
  );
};

export default TimeoutGameForm;
