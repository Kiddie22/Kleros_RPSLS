import { zodResolver } from "@hookform/resolvers/zod";
import { ethers } from "ethers";
import { useForm } from "react-hook-form";
import z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { checkWinner, cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useRpsContractFactory } from "@/hooks/useRpsContractFactory";
import { CheckIcon } from "lucide-react";

const SolveGameForm = ({ contractAddress }: { contractAddress: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [winner, setWinner] = useState<string>("");

  const { provider, signer } = useWeb3();
  const { abi } = useRpsContractFactory(signer);

  const moves = {
    Null: 0,
    Rock: 1,
    Paper: 2,
    Scissors: 3,
    Lizard: 4,
    Spock: 5,
  } as const;

  const formSchema = z.object({
    contractAddress: z
      .string()
      .refine((value) => ethers.utils.isAddress(value), {
        message:
          "Provided address is invalid. Please insure you have typed correctly.",
      }),
    p1Move: z.string().min(1, "Please select a move"),
    salt: z.string().min(1, "Please enter your salt"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractAddress: contractAddress,
      p1Move: "",
      salt: "",
    },
  });

  const getContractInfo = async (contractAddress: string) => {
    try {
      const contract = new ethers.Contract(contractAddress, abi, provider!);
      const j1 = await contract.j1();
      const j2 = await contract.j2();
      const c1Hash = await contract.c1Hash();
      const c2 = await contract.c2();
      const stake = await contract.stake();
      return { j1, j2, c1Hash, c2, stake };
    } catch (error) {
      console.log((error as Error).message);
      throw error;
    }
  };

  useEffect(() => {
    const fetchContractInfo = async () => {
      setError("");
      try {
        const contractInfo = await getContractInfo(contractAddress);
        console.log(contractInfo);
      } catch (error) {
        console.log((error as Error).message);
        setError("This does not seem to be a valid RPS contract address.");
      }
    };

    if (contractAddress && ethers.utils.isAddress(contractAddress)) {
      fetchContractInfo();
    }
  }, [contractAddress]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log(values);

      setIsLoading(true);
      setError("");

      const contract = new ethers.Contract(
        values.contractAddress,
        abi,
        signer!
      );

      // Fetch required contract info
      const [j1, c2, stake] = await Promise.all([
        contract.j1(),
        contract.c2(),
        contract.stake(),
      ]);

      // Ensure that the caller is player 1
      if (j1.toLowerCase() !== (await signer!.getAddress()).toLowerCase()) {
        setError(
          "Only player 1 (j1) can solve the game. Please switch to the correct wallet."
        );
        setIsLoading(false);
        return;
      }

      // Ensure that player 2 has made their move
      if (c2 === 0) {
        setError(
          "Player 2 has not made their move yet. Cannot solve the game."
        );
        setIsLoading(false);
        return;
      }

      // Ensure not already solved
      if (stake.isZero()) {
        setError("This game has already been solved.");
        setIsLoading(false);
        return;
      }

      const saltBigNumber = ethers.BigNumber.from(values.salt);
      const moveValue = parseInt(values.p1Move);

      // Check if the hash matches the stored hash
      const c1Hash = await contract.c1Hash();
      const expectedHash = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["uint8", "uint256"],
          [moveValue, saltBigNumber]
        )
      );
      if (c1Hash !== expectedHash) {
        setError(
          "The hash does not match the stored hash. Cannot solve the game."
        );
        setIsLoading(false);
        return;
      }

      console.log("Solving game...");
      const tx = await contract.solve(moveValue, saltBigNumber);
      const receipt = await tx.wait();
      console.log(receipt);

      // Check who won
      const winner = checkWinner(moveValue, c2);
      console.log("Winner:", winner);
      setWinner(winner);

      console.log("Game solved successfully");
      setSuccess(true);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <div className="flex items-center gap-2">
          <CheckIcon className="w-10 h-10 text-green-500 animate-pulse border-2 border-green-500 rounded-full p-1" />
          <p className=" text-xl">Game solved successfully</p>
        </div>
        {winner === "player 1" && (
          <p className="text-sm text-green-500">
            Congratulations! You are the winner! You should receive the entire
            money pool in your wallet shortly.
          </p>
        )}
        {winner === "player 2" && (
          <p className="text-sm text-red-500">
            Sorry but you lost. You won't be receiving any money today.
          </p>
        )}
        {winner === "draw" && (
          <p className="text-sm text-blue-500">
            The game is a draw. You should receive your half of the money pool
            in your wallet shortly.
          </p>
        )}
      </>
    );
  }

  return (
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
                This is the address of the contract you are solving.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="p1Move"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Your move</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setError("");
                  }}
                  value={field.value}
                  disabled={
                    form.getValues("contractAddress") === "" || isLoading
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={moves.Rock.toString()} key={moves.Rock}>
                      Rock
                    </SelectItem>
                    <SelectItem
                      value={moves.Paper.toString()}
                      key={moves.Paper}
                    >
                      Paper
                    </SelectItem>
                    <SelectItem
                      value={moves.Scissors.toString()}
                      key={moves.Scissors}
                    >
                      Scissors
                    </SelectItem>
                    <SelectItem
                      value={moves.Lizard.toString()}
                      key={moves.Lizard}
                    >
                      Lizard
                    </SelectItem>
                    <SelectItem
                      value={moves.Spock.toString()}
                      key={moves.Spock}
                    >
                      Spock
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Reconfirm your move to finalize the game.
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="salt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salt</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setError("");
                  }}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                This is the salt you received when you created the game.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading || error !== ""}>
          {isLoading ? "Solving..." : "Solve game"}
        </Button>
        <p data-slot="form-message" className={cn("text-destructive text-sm")}>
          {error}
        </p>
      </form>
    </Form>
  );
};

export default SolveGameForm;
