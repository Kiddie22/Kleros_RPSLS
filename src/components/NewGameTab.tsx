import { ethers } from "ethers";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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

import { useRpsContractFactory } from "@/hooks/useRpsContractFactory";
import { useWeb3 } from "@/contexts/Web3Context";
import { useState } from "react";

const NewGameTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hash, setHash] = useState<string>("");
  const [contractAddress, setContractAddress] = useState<string>("");

  const { signer } = useWeb3();
  const { contractFactory } = useRpsContractFactory(signer);

  const moves = {
    Null: 0,
    Rock: 1,
    Paper: 2,
    Scissors: 3,
    Lizard: 4,
    Spock: 5,
  } as const;

  const formSchema = z.object({
    p1Move: z.string().min(1, "Please select a move"),
    p2Address: z.string().refine((value) => ethers.utils.isAddress(value), {
      message:
        "Provided address is invalid. Please insure you have typed correctly.",
    }),
    stake: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Stake must be a positive number",
    }),
  });

  // Define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      p1Move: "",
      p2Address: "",
      stake: "0",
    },
  });

  // Define a submit handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      console.log(values);

      if (process.env.VITE_HASH_SALT === undefined) {
        throw new Error("VITE_HASH_SALT is not defined");
      }

      const salt = process.env.VITE_HASH_SALT;
      const moveValue = parseInt(values.p1Move);
      const saltNumber = parseInt(salt);
      const hash = ethers.utils.keccak256(
        new Uint8Array([moveValue, saltNumber])
      );
      setHash(hash);
      console.log(hash);

      console.log(contractFactory);
      console.log("Deploying contract...");
      const contract = await contractFactory?.deploy(hash, values.p2Address, {
        value: ethers.utils.parseEther(values.stake),
      });
      console.log("contract address", contract?.address);
      await contract?.deployTransaction.wait();
      console.log("contract deployed");
      setContractAddress(contract?.address!);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl py-3">Start a new game</h1>

      {contractAddress ? (
        <>
          <p>Contract deployed to address: {contractAddress}</p>
          <p>Send this to your opponent to join the game</p>
          <p>Keep your hash safe, you will need it to play the game</p>
          <p>Hash: {hash}</p>
        </>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="p1Move"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Your move</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          value={moves.Rock.toString()}
                          key={moves.Rock}
                        >
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
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="p2Address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address of opponent</FormLabel>
                  <FormControl>
                    <Input placeholder="0x..." {...field} />
                  </FormControl>
                  <FormDescription>
                    This is who you are playing against.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stake"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stake value</FormLabel>
                  <FormControl>
                    <Input placeholder="0" {...field} type="number" />
                  </FormControl>
                  <FormDescription>
                    This stake will be matched by your opponent.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Deploying..." : "Start game"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default NewGameTab;
